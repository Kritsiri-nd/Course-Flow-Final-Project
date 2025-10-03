"use client";

import { Card } from "@/components/ui/card";

export default function VideoSection() {
  return (
    <div className="space-y-4">
      <h1 className="text-h2">4 Levels of Service Design in an Organization</h1>
      <Card className="overflow-hidden">
        <div className="relative aspect-video">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Course Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Card>
    </div>
  );
}
