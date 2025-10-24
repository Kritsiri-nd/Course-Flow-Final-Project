"use client";

import { useEffect, useRef, useState } from "react";
import { calculateResumePosition } from "@/lib/lessonProgressUtils";

type Props = {
  title: string;
  videoUrl?: string | null;
  lessonId?: number | null;
  content?: string | null;
  onProgressChange?: () => void;
};

export default function VideoSection(props: Props) {
  const { title, videoUrl, lessonId, content, onProgressChange } = props;

  const playerRef = useRef<any>(null);
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const resumeSecondsRef = useRef(0);
  const lastSentAtRef = useRef<number>(0);

  // ====== 1. หา playback ID จาก Mux URL ======
  useEffect(() => {
    if (!videoUrl) {
      setPlaybackId(null);
      return;
    }

    // Extract playback ID from Mux URL
    const match = videoUrl.match(/player\.mux\.com\/([a-zA-Z0-9_-]+)/);
    setPlaybackId(match ? match[1] : null);
  }, [videoUrl]);

  // ====== 2. โหลด mux-player script ======
  useEffect(() => {
    if (!playbackId) return;
    if (typeof window === "undefined") return;

    // ถ้าโหลดแล้ว ไม่ต้องโหลดซ้ำ
    if ((window as any).customElements?.get("mux-player")) return;

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@mux/mux-player@2";
    script.defer = true;
    document.head.appendChild(script);
  }, [playbackId]);

  // ====== 3. โหลดตำแหน่งล่าสุดสำหรับ resume ======
  useEffect(() => {
    if (!lessonId) return;

    let ignore = false;

    async function loadResumePosition() {
      try {
        const res = await fetch(`/api/lesson-progress?lesson_id=${lessonId}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (ignore || !data?.last_position_seconds) return;

        const lastPosition = Number(data.last_position_seconds) || 0;
        const watchedTime = Number(data.seconds_watched) || 0;
        const duration = Number(data.duration_seconds) || 0;
        const isCompleted = !!data.completed_at;

        // คำนวณตำแหน่ง resume ที่เหมาะสม
        const resumePosition = calculateResumePosition(
          lastPosition,
          watchedTime,
          duration,
          isCompleted
        );

        resumeSecondsRef.current = resumePosition;
      } catch (error) {
        console.error("Failed to load resume position:", error);
      }
    }

    loadResumePosition();

    return () => {
      ignore = true;
    };
  }, [lessonId]);

  // ====== 4. ส่งข้อมูล progress ไปยัง API ======
  async function sendProgress(
    currentPosition: number,
    duration: number,
    watchedSeconds: number
  ) {
    if (!lessonId) return;

    try {
      console.log(
        `Sending progress for lesson ${lessonId}: position=${currentPosition}, duration=${duration}, watched=${watchedSeconds}`
      );

      await fetch("/api/lesson-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lessonId,
          duration_seconds: Math.round(duration || 0),
          last_position_seconds: Math.round(currentPosition || 0),
          seconds_watched: Math.max(
            0,
            Math.min(60, Math.round(watchedSeconds || 0))
          ), // จำกัด 60 วิ/ครั้ง
        }),
      });

      console.log(`Progress sent successfully for lesson ${lessonId}`);

      // แจ้งให้ parent component รู้ว่ามีการเปลี่ยนแปลง
      onProgressChange?.();
    } catch (error) {
      console.error("Failed to send progress:", error);
    }
  }

  // ====== 5. ตรวจสอบว่าควรส่งข้อมูลหรือยัง ======
  function checkAndSendProgress(
    currentPosition: number,
    duration: number,
    forceUpdate = false
  ) {
    const now = Date.now();
    const timeSinceLastSent = now - (lastSentAtRef.current || 0);

    // ส่งทุก 5 วินาที หรือเมื่อบังคับ (เช่น จบวิดีโอ)
    const shouldSend = forceUpdate || timeSinceLastSent >= 5000;

    if (!shouldSend) return;

    // คำนวณว่าดูไปกี่วินาที
    const watchedSeconds = Math.floor(timeSinceLastSent / 1000);

    lastSentAtRef.current = now;
    sendProgress(currentPosition, duration, watchedSeconds);
  }

  // ====== 6. ผูก event listeners กับ video player ======
  useEffect(() => {
    const player = playerRef.current as any | null;
    if (!player || !lessonId) return;

    // เมื่อโหลดวิดีโอเสร็จ -> resume จากตำแหน่งล่าสุด
    function handleLoaded() {
      if (resumeSecondsRef.current > 0) {
        try {
          player.currentTime = resumeSecondsRef.current;
          console.log(`Resumed at ${resumeSecondsRef.current}s`);
        } catch (error) {
          console.error("Failed to seek:", error);
        }
      }
    }

    // เมื่อเวลาเปลี่ยน -> อัพเดท progress
    function handleTimeUpdate() {
      const current = Number(player.currentTime || 0);
      const duration = Number(player.duration || 0);

      if (duration > 0) {
        checkAndSendProgress(current, duration);
      }
    }

    // เมื่อจบวิดีโอ -> ส่งข้อมูลครั้งสุดท้าย
    function handleEnded() {
      const duration = Number(player.duration || 0);
      checkAndSendProgress(duration, duration, true);
      console.log("Video ended");
    }

    // ผูก events
    player.addEventListener("loadedmetadata", handleLoaded);
    player.addEventListener("timeupdate", handleTimeUpdate);
    player.addEventListener("ended", handleEnded);

    // ถอด events เมื่อ component unmount
    return () => {
      player.removeEventListener("loadedmetadata", handleLoaded);
      player.removeEventListener("timeupdate", handleTimeUpdate);
      player.removeEventListener("ended", handleEnded);
    };
  }, [lessonId, playbackId]);

  // ====== 7. Auto-complete สำหรับบทเรียนไม่มีวิดีโอ ======
  useEffect(() => {
    if (!lessonId) return;

    // ถ้าไม่มีวิดีโอ (ไม่มี playbackId และไม่มี videoUrl) = ส่ง progress เพื่อ mark ว่าเข้าหน้าแล้ว
    if (!playbackId && !videoUrl) {
      console.log(`Lesson ${lessonId}: No video detected, marking as visited`);
      console.log(
        `Lesson ${lessonId}: playbackId=${playbackId}, videoUrl=${videoUrl}`
      );
      sendProgress(1, 0, 0); // position=1, duration=0, watched=0
    }
  }, [lessonId, playbackId, videoUrl]);

  // ====== 8. Render UI ======
  console.log("Lesson content:", {
    lessonId,
    contentLength: content?.length,
    hasContent: !!content,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-h2">{title}</h1>

      {/* Show video player if video exists */}
      {(playbackId || videoUrl) && (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
          {playbackId ? (
            // Mux Player (track progress ได้)
            // @ts-expect-error custom element
            <mux-player
              ref={playerRef}
              class="absolute inset-0 w-full h-full"
              playback-id={playbackId}
              stream-type="on-demand"
              playsinline
              accent-color="linear-gradient(90deg, #95BEFF, #0040E5)"
            />
          ) : (
            // Fallback: iframe (ไม่ track progress)
            <iframe
              className="absolute inset-0 w-full h-full"
              src={videoUrl!}
              title="Course Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      )}

      {/* Show lesson content if it exists */}
      {content && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
          <div className="text-b1 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
