"use client";

import LearningSidebar from "@/components/course/learning/LearningSidebar";
import VideoSection from "@/components/course/learning/VideoSection";
import AssignmentCard from "@/components/course/learning/AssignmentCard";
import BottomNav from "@/components/course/learning/BottomNav";
import Footer from "@/components/ui/footer";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { Course, Lesson, Module } from "@/types";

export default function UserCourseLearningPage() {
  const params = useParams<{ id: string }>();
  const courseId = params?.id ? Number(params.id) : null;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!courseId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        const data: Course = await res.json();
        if (!ignore) {
          setCourse(data);
          const firstLesson: Lesson | undefined = data.modules?.[0]
            ?.lessons?.[0] as unknown as Lesson | undefined;
          setSelectedLessonId(firstLesson ? Number(firstLesson.id) : null);
        }
      } catch {
        if (!ignore) setCourse(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [courseId]);

  const selectedLesson: Lesson | null = useMemo(() => {
    if (!course || !selectedLessonId) return null;
    for (const m of course.modules ?? []) {
      const match = (m.lessons ?? []).find(
        (l) => Number(l.id) === Number(selectedLessonId)
      );
      if (match) return match as unknown as Lesson;
    }
    return null;
  }, [course, selectedLessonId]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-2 sm:px-6 md:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="order-2 md:order-1 md:col-span-1">
            {course ? (
              <LearningSidebar
                courseTitle={course.title}
                summary={course.summary}
                modules={(course.modules ?? []).map((m: Module) => ({
                  id: m.id,
                  title: m.title,
                  lessons: (m.lessons ?? []).map((l: Lesson) => ({
                    id: l.id,
                    title: l.title,
                  })),
                }))}
                selectedLessonId={selectedLessonId}
                onSelectLesson={(id) => setSelectedLessonId(id)}
              />
            ) : (
              <div className="text-b2 text-muted-foreground">
                {loading ? "Loading..." : "Course not found."}
              </div>
            )}
          </div>
          <div className="order-1 md:order-2 md:col-span-2 space-y-6">
            <VideoSection
              title={selectedLesson?.title || ""}
              videoUrl={selectedLesson?.video_url || undefined}
            />
            <AssignmentCard lessonId={selectedLessonId} />
            <BottomNav />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
