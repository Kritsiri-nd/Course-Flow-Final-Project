import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const asset = await mux.video.assets.retrieve(id);

        return NextResponse.json({
            status: asset.status,
            playbackUrl: asset.playback_ids?.[0]
                ? `https://player.mux.com/${asset.playback_ids[0].id}`
                : null,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to get asset status" },
            { status: 500 }
        );
    }
}