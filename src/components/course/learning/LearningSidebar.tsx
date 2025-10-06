"use client";

import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

type SidebarLesson = { id: number; title: string };
type SidebarModule = { id: number; title: string; lessons: SidebarLesson[] };

type LearningSidebarProps = {
  courseTitle: string;
  summary?: string | null;
  modules: SidebarModule[];
  selectedLessonId?: number | null;
  onSelectLesson?: (lessonId: number) => void;
  courseId?: number | null;
  refreshTrigger?: number; // increment to refresh progress
};

export default function LearningSidebar(props: LearningSidebarProps) {
  const {
    courseTitle,
    summary,
    modules,
    selectedLessonId,
    onSelectLesson,
    courseId,
    refreshTrigger,
  } = props;

  const [overallPercent, setOverallPercent] = useState<number>(0);
  const [statusMap, setStatusMap] = useState<
    Record<
      number,
      { status: "completed" | "in_progress" | "not_started"; percent: number }
    >
  >({});

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!courseId) return;
      console.log(
        "Loading progress for course:",
        courseId,
        "trigger:",
        refreshTrigger
      );
      try {
        const res = await fetch(
          `/api/lesson-progress?course_id=${courseId}&bulk=true`
        );
        const data = await res.json();
        console.log("Progress data received:", data);
        if (!ignore && data && !data.error) {
          setOverallPercent(Number(data.overallPercent || 0));
          setStatusMap(data.lessonStatus || {});
        }
      } catch (error) {
        console.error("Error loading progress:", error);
        if (!ignore) {
          setOverallPercent(0);
          setStatusMap({});
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [courseId, refreshTrigger]);

  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-orange-500 text-b3">Course</p>
          <h2 className="text-h3 leading-tight">{courseTitle}</h2>
          {summary ? (
            <p className="text-b3 text-muted-foreground">{summary}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-b3 text-muted-foreground">
            {overallPercent}% Complete
          </p>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-700 transition-[width] duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {modules.map((m) => (
            <AccordionItem
              key={m.id}
              value={`module-${m.id}`}
              className="border rounded-md"
            >
              <AccordionTrigger className="px-4 py-3">
                {m.title}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-3">
                  {m.lessons?.map((l) => {
                    const isActive = Number(selectedLessonId) === Number(l.id);
                    const status = statusMap[l.id]?.status || "not_started";
                    const statusStyle =
                      status === "completed"
                        ? "bg-emerald-500 text-white"
                        : status === "in_progress"
                        ? "border-2 border-emerald-500 text-emerald-500"
                        : "border-2 border-gray-300 text-gray-300";
                    const statusShape =
                      status === "completed" ? (
                        <span className="inline-flex items-center justify-center size-5 rounded-full bg-emerald-500">
                          <svg
                            viewBox="0 0 20 20"
                            className="size-3 text-white"
                            aria-hidden
                          >
                            <path
                              fill="currentColor"
                              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-3-3A1 1 0 0 1 6.7 9.3l2.3 2.3l6.3-6.3a1 1 0 0 1 1.4 0"
                            />
                          </svg>
                        </span>
                      ) : status === "in_progress" ? (
                        <span className="relative inline-flex items-center justify-center size-5">
                          <span className="absolute inset-0 rounded-full border-2 border-emerald-500 opacity-30" />
                          <span
                            className="absolute left-0 top-0 bottom-0 rounded-l-full bg-emerald-500"
                            style={{ width: "50%" }}
                          />
                          <span className="relative size-5 rounded-full border-2 border-emerald-500" />
                        </span>
                      ) : (
                        <span className="inline-block size-5 rounded-full border-2 border-gray-300" />
                      );
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => onSelectLesson?.(l.id)}
                          className={cn(
                            "w-full text-left flex items-center gap-3 text-b2 rounded-md px-2 py-2",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50"
                          )}
                        >
                          {statusShape}
                          {l.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  );
}
