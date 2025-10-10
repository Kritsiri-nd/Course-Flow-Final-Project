"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Assignment } from "@/types";

type AssignmentCardProps = {
  lessonId?: number | null;
};

export default function AssignmentCard({ lessonId }: AssignmentCardProps) {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!lessonId) {
        setAssignments(null);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/assignments?lesson_id=${lessonId}`);
        const data = await res.json();
        if (!ignore) setAssignments(data ?? []);
      } catch {
        if (!ignore) setAssignments([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [lessonId]);

  return (
    <Card className="bg-blue-50/60 border-none p-6 md:p-8">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-h3">Assignment</h3>
      </div>
      {!lessonId ? (
        <p className="text-b2 text-muted-foreground">
          Select a lesson to view assignment.
        </p>
      ) : loading ? (
        <p className="text-b2 text-muted-foreground">Loading assignment...</p>
      ) : assignments && assignments.length > 0 ? (
        <div className="space-y-6">
          {assignments.map((a) => (
            <div key={a.id} className="space-y-3">
              <p className="text-b2 text-muted-foreground">{a.question}</p>
              {a.answer ? (
                <div className="text-b2 text-gray-700 whitespace-pre-line">
                  {a.answer}
                </div>
              ) : (
                <div className="text-b2 text-gray-500">
                  No answer provided yet.
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-b2 text-muted-foreground">
          No assignment for this lesson.
        </p>
      )}
    </Card>
  );
}
