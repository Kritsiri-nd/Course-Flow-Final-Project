import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
);

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const file = form.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        // Create a direct upload for the video file
        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                playback_policy: ["public"],
                encoding_tier: "baseline", // or "smart" for better quality
            },
            cors_origin: "*", // Configure this based on your domain in production
        });

        // Convert file to buffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload the file to MUX using the upload URL
        const uploadResponse = await fetch(upload.url, {
            method: "PUT",
            body: buffer,
            headers: {
                "Content-Type": file.type || "video/mp4",
            },
        });

        if (!uploadResponse.ok) {
            throw new Error("Failed to upload to MUX");
        }

        // Return the asset ID and playback URL
        // Note: The playback URL will be available once MUX processes the video
        const playbackUrl = `https://stream.mux.com/${upload.asset_id}.m3u8`;

        return NextResponse.json(
            {
                assetId: upload.asset_id,
                uploadId: upload.id,
                url: playbackUrl,
                status: "processing", // MUX will process the video
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unexpected server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE method to remove video from both Supabase database and Mux service
 * 
 * Request body:
 * {
 *   "videoUrl": "https://stream.mux.com/asset_id.m3u8",
 *   "recordType": "course" | "lesson",
 *   "recordId": number,
 *   "forceDelete": boolean (optional, default: false)
 * }
 */
export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const {
            videoUrl,
            recordType,
            recordId,
            forceDelete = false
        }: {
            videoUrl: string;
            recordType: 'course' | 'lesson';
            recordId: number;
            forceDelete?: boolean;
        } = body;

        // Validate required fields
        if (!videoUrl || !recordType || !recordId) {
            return NextResponse.json(
                { error: "Missing required fields: videoUrl, recordType, recordId" },
                { status: 400 }
            );
        }

        // Validate recordType
        if (!['course', 'lesson'].includes(recordType)) {
            return NextResponse.json(
                { error: "recordType must be either 'course' or 'lesson'" },
                { status: 400 }
            );
        }

        const results = {
            supabaseSuccess: false,
            muxSuccess: false,
            assetId: null as string | null,
            errors: [] as string[]
        };

        // Step 1: Remove video URL from Supabase database
        try {
            const tableName = recordType === 'course' ? 'courses' : 'lessons';
            const { error: supabaseError } = await supabase
                .from(tableName)
                .update({ video_url: null })
                .eq('id', recordId);

            if (supabaseError) {
                results.errors.push(`Supabase error: ${supabaseError.message}`);
            } else {
                results.supabaseSuccess = true;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown Supabase error";
            results.errors.push(`Supabase error: ${message}`);
        }

        // Step 2: Extract asset ID from Mux URL and delete from Mux
        try {
            // Extract asset ID from Mux URL pattern: https://stream.mux.com/{asset_id}.m3u8
            const muxUrlPattern = /https:\/\/stream\.mux\.com\/([^.]+)\.m3u8/;
            const match = videoUrl.match(muxUrlPattern);

            if (match && match[1]) {
                const assetId = match[1];
                results.assetId = assetId;

                // Delete asset from Mux
                await mux.video.assets.delete(assetId);
                results.muxSuccess = true;
            } else {
                results.errors.push("Invalid Mux URL format - could not extract asset ID");
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown Mux error";
            results.errors.push(`Mux error: ${message}`);
        }

        // Determine response based on results
        const hasErrors = results.errors.length > 0;
        const partialSuccess = results.supabaseSuccess || results.muxSuccess;

        if (!hasErrors && results.supabaseSuccess && results.muxSuccess) {
            // Complete success
            return NextResponse.json({
                success: true,
                message: "Video successfully removed from both Supabase and Mux",
                details: results
            }, { status: 200 });
        } else if (partialSuccess && !forceDelete) {
            // Partial success - return warning
            return NextResponse.json({
                success: false,
                message: "Partial deletion completed with errors",
                details: results,
                suggestion: "Use forceDelete: true to ignore errors and return success for partial completion"
            }, { status: 207 }); // 207 Multi-Status
        } else if (partialSuccess && forceDelete) {
            // Partial success but force delete enabled
            return NextResponse.json({
                success: true,
                message: "Video deletion completed (some operations failed but forceDelete enabled)",
                details: results
            }, { status: 200 });
        } else {
            // Complete failure
            return NextResponse.json({
                success: false,
                message: "Failed to delete video from both services",
                details: results
            }, { status: 500 });
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unexpected server error";
        return NextResponse.json({
            success: false,
            error: message,
            message: "Internal server error during video deletion"
        }, { status: 500 });
    }
}