"use client";

import { Button } from "@/components/ui/button";
import { useMemo } from "react";

type Props = {
  modules: { lessons?: { id: number }[] }[];
  currentLessonId: number | null;
  onLessonChange: (lessonId: number) => void;
};

export default function BottomNav({
  modules,
  currentLessonId,
  onLessonChange,
}: Props) {
  const allLessons = useMemo(
    () => modules.flatMap((m) => m.lessons ?? []),
    [modules]
  );
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

  const handleNavigate = (lessonId: number) => {
    onLessonChange(lessonId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allLessons.length - 1;

  return (
    <div className="flex items-center justify-between py-6 px-4 md:px-8 lg:px-12 border-t shadow-xl">
      {hasPrevious ? (
        <Button
          variant="link"
          className="text-blue-500 font-medium px-0"
          onClick={() => handleNavigate(allLessons[currentIndex - 1].id)}
        >
          Previous Lesson
        </Button>
      ) : (
        <div />
      )}
      {hasNext && (
        <Button
          className="btn-blue-500 hover:bg-blue-600 px-6 py-6 font-medium"
          onClick={() => handleNavigate(allLessons[currentIndex + 1].id)}
        >
          Next Lesson
        </Button>
      )}
    </div>
  );
}
