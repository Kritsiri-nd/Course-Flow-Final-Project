"use client";

import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type SidebarLesson = { id: number; title: string };
type SidebarModule = { id: number; title: string; lessons: SidebarLesson[] };

type LearningSidebarProps = {
  courseTitle: string;
  summary?: string | null;
  modules: SidebarModule[];
  selectedLessonId?: number | null;
  onSelectLesson?: (lessonId: number) => void;
};

export default function LearningSidebar(props: LearningSidebarProps) {
  const { courseTitle, summary, modules, selectedLessonId, onSelectLesson } =
    props;

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

        {/* Progress placeholder - optional wiring later */}
        <div className="space-y-2">
          <p className="text-b3 text-muted-foreground">Progress</p>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-[0%] bg-blue-600" />
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
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              isActive ? "bg-blue-500" : "bg-green-500"
                            )}
                          />
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
