import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

export const runtime = "nodejs";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

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