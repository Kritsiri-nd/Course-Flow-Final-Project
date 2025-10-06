"use client";

import { Card } from "@/components/ui/card";

type VideoSectionProps = {
  title: string;
  videoUrl?: string | null;
};

export default function VideoSection({ title, videoUrl }: VideoSectionProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-h2">{title}</h1>
      <Card className="overflow-hidden">
        <div className="relative aspect-video">
          {videoUrl ? (
            <iframe
              className="w-full h-full"
              src={videoUrl}
              title="Course Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-muted-foreground">
              No video for this lesson
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
