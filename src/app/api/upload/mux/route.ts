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

/**
 * Helper function to extract a Mux playback ID from various URL formats
 */
function extractMuxPlaybackId(url: string): string | null {
    if (!url || typeof url !== 'string') {
        console.error('❌ Invalid URL provided:', url);
        return null;
    }

    console.log('🔍 Attempting to extract playback ID from URL:', url);

    // Try multiple patterns to handle different URL formats
    const patterns = [
        // Standard m3u8 format: https://stream.mux.com/{playback_id}.m3u8
        /https:\/\/stream\.mux\.com\/([a-zA-Z0-9]+)\.m3u8/,
        // Without .m3u8 extension: https://stream.mux.com/{playback_id}
        /https:\/\/stream\.mux\.com\/([a-zA-Z0-9]+)$/,
        // Player URL: https://player.mux.com/{playback_id}
        /https:\/\/player\.mux\.com\/([a-zA-Z0-9]+)/,
        // Just the playback ID if it's passed directly
        /^([a-zA-Z0-9]{20,})$/
    ];

    for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const match = url.match(pattern);

        console.log(`- Pattern ${i + 1} (${pattern}):`, match ? `✅ Match found: ${match[1]}` : '❌ No match');

        if (match && match[1] && match[1] !== 'undefined') {
            const playbackId = match[1];
            console.log(`✅ Successfully extracted playback ID: ${playbackId}`);
            return playbackId;
        }
    }

    console.error('❌ Could not extract playback ID from any pattern');
    return null;
}

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const file = form.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        console.log('🎬 Starting Mux upload process...');
        console.log('- File name:', file.name);
        console.log('- File size:', file.size);
        console.log('- File type:', file.type);

        // Create a direct upload for the video file
        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                playback_policy: ["public"],
                encoding_tier: "baseline", // or "smart" for better quality
            },
            cors_origin: "*", // Configure this based on your domain in production
        });

        console.log('- Upload created:', {
            id: upload.id,
            url: upload.url,
            asset_id: upload.asset_id
        });

        // Convert file to buffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload the file to MUX using the upload URL
        console.log('- Uploading file to Mux...');
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

        console.log('- File uploaded successfully');

        // The asset_id might not be available immediately, so we need to wait or poll
        let assetId = upload.asset_id;

        // If asset_id is not available, we need to get it from the upload
        if (!assetId) {
            console.log('- Asset ID not immediately available, retrieving upload info...');
            try {
                // Wait a moment for Mux to process
                await new Promise(resolve => setTimeout(resolve, 1000));

                const uploadInfo = await mux.video.uploads.retrieve(upload.id);
                assetId = uploadInfo.asset_id;
                console.log('- Retrieved asset ID from upload:', assetId);
            } catch (error) {
                console.error('- Failed to retrieve asset ID:', error);
            }
        }

        // If we still don't have an asset ID, we'll use the upload ID as a fallback
        if (!assetId) {
            console.warn('- Asset ID still not available, using upload ID as reference');
            // We'll return a temporary URL and handle this case
            return NextResponse.json({
                assetId: null,
                uploadId: upload.id,
                url: null,
                status: "processing",
                message: "Upload successful, asset ID will be available shortly"
            }, { status: 202 }); // 202 Accepted
        }

        // Ensure there is a public playback ID, then build player URL
        let playbackId: string | null = null;
        try {
            const asset = await mux.video.assets.retrieve(assetId);
            const existing = (asset as any)?.playback_ids?.find((p: any) => p?.policy === 'public')
                || (asset as any)?.playback_ids?.[0];
            if (existing?.id) {
                playbackId = existing.id;
            } else {
                const created = await (mux.video.assets as any).playbackIds.create(assetId, { policy: 'public' });
                playbackId = (created as any)?.id ?? null;
            }
        } catch (e) {
            console.warn('⚠️ Could not obtain playback ID immediately:', e);
        }

        const playbackUrl = playbackId ? `https://player.mux.com/${playbackId}` : `https://stream.mux.com/${assetId}.m3u8`;

        console.log('✅ Upload completed successfully:', {
            assetId,
            uploadId: upload.id,
            playbackId,
            playbackUrl
        });

        return NextResponse.json(
            {
                assetId: assetId,
                uploadId: upload.id,
                playbackId: playbackId,
                url: playbackUrl,
                status: "processing", // MUX will process the video
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Unexpected server error";
        console.error('❌ Upload failed:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE method to remove video from both Mux and Supabase
 * Order: Mux first, then Supabase (safer approach)
 */
export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const {
            videoUrl,
            recordType,
            recordId,
            forceDelete = false,
            videoAssetId
        }: {
            videoUrl: string;
            recordType: 'course' | 'lesson';
            recordId: number;
            forceDelete?: boolean;
            videoAssetId?: string | null;
        } = body;

        console.log('🗑️ DELETE REQUEST RECEIVED:');
        console.log('- Video URL:', JSON.stringify(videoUrl));
        console.log('- Video URL type:', typeof videoUrl);
        console.log('- Video URL length:', videoUrl?.length);
        console.log('- Record Type:', recordType);
        console.log('- Record ID:', recordId);
        console.log('- Force Delete:', forceDelete);

        // Validate required fields
        if (!videoUrl || !recordType || !recordId) {
            console.error('❌ Missing required fields');
            return NextResponse.json(
                { error: "Missing required fields: videoUrl, recordType, recordId" },
                { status: 400 }
            );
        }

        // Check if URL contains 'undefined' - if so, skip Mux deletion
        if (videoUrl.includes('undefined')) {
            console.log('⚠️ URL contains "undefined", skipping Mux deletion and only updating database');

            try {
                const tableName = recordType === 'course' ? 'courses' : 'lessons';
                console.log(`- Updating table: ${tableName}, ID: ${recordId}`);

                const updatePayload = tableName === 'courses'
                    ? { video_url: null }
                    : { video_url: null, video_asset_id: null } as Record<string, unknown>;

                const { error: supabaseError } = await supabase
                    .from(tableName)
                    .update(updatePayload)
                    .eq('id', recordId);

                if (supabaseError) {
                    console.error('❌ Supabase error:', supabaseError.message);
                    return NextResponse.json({
                        success: false,
                        message: "Failed to update database",
                        error: supabaseError.message
                    }, { status: 500 });
                } else {
                    console.log('✅ Database updated successfully');
                    return NextResponse.json({
                        success: true,
                        message: "Invalid video URL removed from database",
                        details: {
                            muxSuccess: false,
                            supabaseSuccess: true,
                            assetId: null,
                            note: "Skipped Mux deletion due to invalid URL"
                        }
                    }, { status: 200 });
                }
            } catch (error) {
                console.error('❌ Database update failed:', error);
                return NextResponse.json({
                    success: false,
                    message: "Failed to update database",
                    error: error instanceof Error ? error.message : "Unknown error"
                }, { status: 500 });
            }
        }

        // Validate recordType
        if (!['course', 'lesson'].includes(recordType)) {
            console.error('❌ Invalid record type:', recordType);
            return NextResponse.json(
                { error: "recordType must be either 'course' or 'lesson'" },
                { status: 400 }
            );
        }

        const results = {
            muxSuccess: false,
            supabaseSuccess: false,
            assetId: null as string | null,
            errors: [] as string[]
        };

        // Step 1: Resolve asset ID and delete from Mux FIRST
        console.log('🎬 Step 1: Deleting from Mux first...');
        try {
            let resolvedAssetId: string | null = null;

            if (videoAssetId) {
                resolvedAssetId = videoAssetId;
                console.log(`- Using provided asset ID: ${resolvedAssetId}`);
            } else {
                const playbackId = extractMuxPlaybackId(videoUrl);
                if (playbackId) {
                    console.log(`- Extracted playback ID: ${playbackId}`);
                    try {
                        const playback = await mux.video.playbackIds.retrieve(playbackId);
                        resolvedAssetId = (playback as any)?.asset_id ?? null;
                        console.log(`- Resolved asset ID from playback ID: ${resolvedAssetId}`);
                    } catch (resolveErr) {
                        console.warn('⚠️ Failed to resolve asset from playback ID:', resolveErr);
                    }
                }
            }

            if (resolvedAssetId) {
                results.assetId = resolvedAssetId;
                console.log(`- Final Asset ID to delete: ${resolvedAssetId}`);
                console.log('- Attempting to delete from Mux...');

                // Verify asset exists before trying to delete
                try {
                    const asset = await mux.video.assets.retrieve(resolvedAssetId);
                    console.log(`- Asset found in Mux: ${asset.id} (status: ${asset.status})`);
                } catch (retrieveError) {
                    console.warn('⚠️ Asset not found in Mux (might already be deleted):', retrieveError);
                    // Continue with deletion attempt anyway
                }

                // Delete asset from Mux
                await mux.video.assets.delete(resolvedAssetId);
                console.log('✅ Mux deletion successful');
                results.muxSuccess = true;
            } else {
                console.error('❌ Could not resolve asset ID from provided data');
                results.errors.push("Invalid Mux identifiers - could not resolve asset ID");
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown Mux error";
            console.error('❌ Mux deletion failed:', message);

            // Check if it's a "not found" error (asset already deleted)
            if (message.includes('not found') || message.includes('404')) {
                console.log('ℹ️ Asset already deleted from Mux, treating as success');
                results.muxSuccess = true;
            } else {
                results.errors.push(`Mux error: ${message}`);
            }
        }

        // Step 2: Only proceed with Supabase if Mux deletion succeeded OR forceDelete is true
        if (results.muxSuccess || forceDelete) {
            console.log('📊 Step 2: Updating Supabase database...');
            try {
                const tableName = recordType === 'course' ? 'courses' : 'lessons';
                console.log(`- Updating table: ${tableName}, ID: ${recordId}`);

                const updatePayload = tableName === 'courses'
                    ? { video_url: null }
                    : { video_url: null, video_asset_id: null } as Record<string, unknown>;

                const { error: supabaseError } = await supabase
                    .from(tableName)
                    .update(updatePayload)
                    .eq('id', recordId);

                if (supabaseError) {
                    console.error('❌ Supabase error:', supabaseError.message);
                    results.errors.push(`Supabase error: ${supabaseError.message}`);
                } else {
                    console.log('✅ Supabase update successful');
                    results.supabaseSuccess = true;
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown Supabase error";
                console.error('❌ Supabase exception:', message);
                results.errors.push(`Supabase error: ${message}`);
            }
        } else {
            console.log('⏭️ Skipping Supabase update because Mux deletion failed and forceDelete is false');
            results.errors.push("Skipped Supabase update because Mux deletion failed");
        }

        // Log final results
        console.log('📋 DELETION RESULTS:');
        console.log('- Mux Success:', results.muxSuccess);
        console.log('- Supabase Success:', results.supabaseSuccess);
        console.log('- Asset ID:', results.assetId);
        console.log('- Errors:', results.errors);

        // Determine response based on results
        const hasErrors = results.errors.length > 0;
        const partialSuccess = results.muxSuccess || results.supabaseSuccess;

        if (!hasErrors && results.muxSuccess && results.supabaseSuccess) {
            // Complete success
            console.log('🎉 Complete success!');
            return NextResponse.json({
                success: true,
                message: "Video successfully removed from both Mux and Supabase",
                details: results
            }, { status: 200 });
        } else if (results.muxSuccess && !results.supabaseSuccess && !forceDelete) {
            // Mux succeeded but Supabase failed - this is problematic
            console.log('⚠️ Mux deleted but Supabase failed - data inconsistency!');
            return NextResponse.json({
                success: false,
                message: "Video deleted from Mux but failed to update database - data inconsistency detected",
                details: results,
                suggestion: "Manual database cleanup may be required"
            }, { status: 207 }); // 207 Multi-Status
        } else if (partialSuccess && forceDelete) {
            // Partial success but force delete enabled
            console.log('🎉 Partial success (with force delete enabled)');
            return NextResponse.json({
                success: true,
                message: "Video deletion completed (some operations failed but forceDelete enabled)",
                details: results
            }, { status: 200 });
        } else if (!results.muxSuccess) {
            // Mux deletion failed - this is the primary failure
            console.log('💥 Mux deletion failed - primary operation failed');
            return NextResponse.json({
                success: false,
                message: "Failed to delete video from Mux - operation aborted",
                details: results,
                suggestion: "Check Mux credentials and asset ID extraction"
            }, { status: 500 });
        } else {
            // Other failure cases
            console.log('💥 Other failure');
            return NextResponse.json({
                success: false,
                message: "Failed to delete video",
                details: results
            }, { status: 500 });
        }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unexpected server error";
        console.error('💥 Unexpected error in DELETE:', message);
        return NextResponse.json({
            success: false,
            error: message,
            message: "Internal server error during video deletion"
        }, { status: 500 });
    }
}