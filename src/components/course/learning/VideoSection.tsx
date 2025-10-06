"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

type VideoSectionProps = {
  title: string;
  videoUrl?: string | null;
  lessonId?: number | null; // used for progress tracking
  onProgressChange?: () => void; // callback when progress updates
};

export default function VideoSection({
  title,
  videoUrl,
  lessonId,
  onProgressChange,
}: VideoSectionProps) {
  const muxPlayerRef = useRef<any>(null);
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const lastReportedTimeRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const resumeTimeRef = useRef<number>(0);

  // Detect Mux playback id from player URL
  useEffect(() => {
    if (!videoUrl) {
      setPlaybackId(null);
      return;
    }
    const muxMatch = videoUrl.match(/player\.mux\.com\/([a-zA-Z0-9_-]+)/);
    setPlaybackId(muxMatch ? muxMatch[1] : null);
  }, [videoUrl]);

  // Load progress to resume
  useEffect(() => {
    let cancelled = false;
    async function loadProgress() {
      if (!lessonId) return;
      try {
        const res = await fetch(`/api/lesson-progress?lesson_id=${lessonId}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && data?.last_position_seconds) {
          resumeTimeRef.current = Number(data.last_position_seconds) || 0;
        }
      } catch {
        // ignore
      }
    }
    loadProgress();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // Load mux-player script once
  useEffect(() => {
    if (!playbackId) return; // only when using mux
    if (typeof window === "undefined") return;
    if ((window as any).customElements?.get("mux-player")) return;
    const s = document.createElement("script");
    s.src = "https://unpkg.com/@mux/mux-player@2";
    s.defer = true;
    document.head.appendChild(s);
    return () => {
      // keep script for reuse; no cleanup
    };
  }, [playbackId]);

  // Attach event listeners to report progress
  useEffect(() => {
    const el = muxPlayerRef.current as any | null;
    if (!el || !lessonId || !playbackId) return;

    function handleLoaded() {
      try {
        if (resumeTimeRef.current > 0) {
          el.currentTime = resumeTimeRef.current;
        }
      } catch {
        /* noop */
      }
    }

    async function report(nowSeconds: number, durationSeconds: number) {
      // throttle: send every ~5s of watch time
      const now = Date.now();
      const deltaWall = now - (lastTickRef.current || 0);
      const deltaWatch = Math.max(
        0,
        Math.round(nowSeconds - (lastReportedTimeRef.current || 0))
      );
      const shouldSend = deltaWatch >= 5 || deltaWall >= 8000; // 5s watched or 8s elapsed
      if (!shouldSend) return;
      lastTickRef.current = now;
      lastReportedTimeRef.current = nowSeconds;
      try {
        await fetch("/api/lesson-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: lessonId,
            duration_seconds: Math.round(durationSeconds || 0),
            last_position_seconds: Math.round(nowSeconds || 0),
            seconds_watched: deltaWatch,
          }),
        });
        // Notify parent that progress has changed
        console.log("Progress reported:", {
          lessonId,
          nowSeconds,
          durationSeconds,
          deltaWatch,
        });
        onProgressChange?.();
      } catch {
        // ignore network errors for progress
      }
    }

    async function reportFinal(nowSeconds: number, durationSeconds: number) {
      // Force send final progress update without throttling
      const deltaWatch = Math.max(
        0,
        Math.round(nowSeconds - (lastReportedTimeRef.current || 0))
      );
      lastTickRef.current = Date.now();
      lastReportedTimeRef.current = nowSeconds;
      try {
        console.log("Sending FINAL progress update:", {
          lessonId,
          nowSeconds,
          durationSeconds,
          deltaWatch,
        });
        await fetch("/api/lesson-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lesson_id: lessonId,
            duration_seconds: Math.round(durationSeconds || 0),
            last_position_seconds: Math.round(nowSeconds || 0),
            seconds_watched: deltaWatch,
          }),
        });
        // Notify parent that progress has changed
        console.log("FINAL progress reported:", {
          lessonId,
          nowSeconds,
          durationSeconds,
          deltaWatch,
        });
        onProgressChange?.();
      } catch (error) {
        console.error("Error sending final progress:", error);
      }
    }

    function handleTimeUpdate() {
      const current = Number(el.currentTime || 0);
      const duration = Number(el.duration || 0);
      if (duration > 0) {
        report(current, duration);
      }
    }

    function handleEnded() {
      const duration = Number(el.duration || 0);
      console.log("Video ended, duration:", duration);
      // Force send final progress update
      reportFinal(duration, duration);
    }

    el.addEventListener("loadedmetadata", handleLoaded);
    el.addEventListener("timeupdate", handleTimeUpdate);
    el.addEventListener("ended", handleEnded);
    return () => {
      el.removeEventListener("loadedmetadata", handleLoaded);
      el.removeEventListener("timeupdate", handleTimeUpdate);
      el.removeEventListener("ended", handleEnded);
    };
  }, [lessonId, playbackId]);

  return (
    <div className="space-y-4">
      <h1 className="text-h2">{title}</h1>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {playbackId ? (
          // Mux Player with progress tracking
          // @ts-expect-error - custom element defined at runtime
          <mux-player
            ref={muxPlayerRef}
            class="absolute inset-0 w-full h-full"
            style={{
              ["--media-object-fit" as any]: "cover",
              ["--media-object-position" as any]: "center",
            }}
            playback-id={playbackId}
            stream-type="on-demand"
            playsinline
            accent-color="#3b82f6"
          />
        ) : videoUrl ? (
          // Fallback iframe (no progress tracking)
          <iframe
            className="absolute inset-0 w-full h-full"
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
    </div>
  );
}
