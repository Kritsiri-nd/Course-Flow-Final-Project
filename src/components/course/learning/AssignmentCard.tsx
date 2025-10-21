"use client";

import { useEffect, useState } from "react";
import { Assignment } from "@/types";

interface UserAssignmentSubmission {
  id: number;
  assignment_id: number;
  user_id: string;
  answer: string;
  status: "pending" | "in-progress" | "submitted";
  submitted_at: string;
  created_at: string;
}

interface AssignmentWithSubmission extends Assignment {
  userSubmission?: UserAssignmentSubmission;
}

type AssignmentCardProps = {
  lessonId?: number | null;
  onProgressChange?: () => void; // เพิ่ม callback สำหรับอัพเดท progress
};

export default function AssignmentCard({
  lessonId,
  onProgressChange,
}: AssignmentCardProps) {
  const [assignments, setAssignments] = useState<
    AssignmentWithSubmission[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submittedAssignments, setSubmittedAssignments] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!lessonId) {
        setAssignments(null);
        return;
      }
      setLoading(true);
      try {
        // Fetch assignments for the lesson
        const res = await fetch(`/api/assignments?lesson_id=${lessonId}`);
        const data = await res.json();

        if (!ignore && data) {
          // For each assignment, check if user has a submission
          const assignmentsWithSubmissions = await Promise.all(
            data.map(async (assignment: Assignment) => {
              try {
                const submissionRes = await fetch(
                  `/api/assignments/${assignment.id}/submission`
                );
                const submissionData = await submissionRes.json();

                return {
                  ...assignment,
                  userSubmission: submissionData.submission || null,
                };
              } catch {
                return {
                  ...assignment,
                  userSubmission: null,
                };
              }
            })
          );

          setAssignments(assignmentsWithSubmissions);

          // Initialize user answers and submitted assignments
          const answers: Record<number, string> = {};
          const submitted = new Set<number>();

          assignmentsWithSubmissions.forEach((assignment) => {
            if (assignment.userSubmission) {
              answers[assignment.id] = assignment.userSubmission.answer || "";
              if (assignment.userSubmission.status === "submitted") {
                submitted.add(assignment.id);
              }
            }
          });

          setUserAnswers(answers);
          setSubmittedAssignments(submitted);
        }
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

  const getAssignmentStatus = (
    assignment: AssignmentWithSubmission
  ): "pending" | "submitted" => {
    if (assignment.userSubmission?.status === "submitted") {
      return "submitted";
    }
    return "pending";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#FFFBDB] text-[#996500]";
      case "submitted":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleAnswerChange = async (
    assignmentId: number,
    newAnswer: string
  ) => {
    setUserAnswers((prev) => ({
      ...prev,
      [assignmentId]: newAnswer,
    }));

    // Auto-save answer as user types
    try {
      await fetch("/api/assignments/submit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId,
          answer: newAnswer,
        }),
      });
    } catch (error) {
      console.error("Error auto-saving answer:", error);
    }
  };

  const handleSubmit = async (assignmentId: number) => {
    const answer = userAnswers[assignmentId];
    if (!answer?.trim()) return;

    try {
      const response = await fetch("/api/assignments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId,
          answer: answer,
        }),
      });

      if (response.ok) {
        setSubmittedAssignments((prev) => new Set([...prev, assignmentId]));

        // Trigger progress update เพื่อให้ sidebar อัพเดทสถานะ
        onProgressChange?.();

        // Reload assignments to get updated status
        const res = await fetch(`/api/assignments?lesson_id=${lessonId}`);
        const data = await res.json();
        if (data) {
          const assignmentsWithSubmissions = await Promise.all(
            data.map(async (assignment: Assignment) => {
              try {
                const submissionRes = await fetch(
                  `/api/assignments/${assignment.id}/submission`
                );
                const submissionData = await submissionRes.json();
                return {
                  ...assignment,
                  userSubmission: submissionData.submission || null,
                };
              } catch {
                return {
                  ...assignment,
                  userSubmission: null,
                };
              }
            })
          );
          setAssignments(assignmentsWithSubmissions);
        }
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
    }
  };

  return (
    <div>
      {!lessonId ? (
        <p className="text-b2 text-muted-foreground">
          Select a lesson to view assignment.
        </p>
      ) : loading ? (
        <p className="text-b2 text-muted-foreground">Loading assignment...</p>
      ) : assignments && assignments.length > 0 ? (
        <div className="space-y-6">
          {assignments.map((assignment) => {
            const status = getAssignmentStatus(assignment);
            const currentAnswer =
              userAnswers[assignment.id] ||
              assignment.userSubmission?.answer ||
              "";
            const isSubmitted = status === "submitted";

            return (
              <div
                key={assignment.id}
                className="bg-[#E5ECF8] rounded-lg p-6 shadow-sm border border-blue-100"
              >
                {/* Header with Title and Status */}
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-normal text-black">Assignment</h3>
                  <span
                    className={`px-3 py-2 text-sm font-medium rounded-sm ${getStatusStyle(
                      status
                    )}`}
                  >
                    {getStatusText(status)}
                  </span>
                </div>

                {/* Question */}
                <div className="mb-6">
                  <h4 className="text-lg font-normal text-black mb-4">
                    {assignment.question}
                  </h4>
                </div>

                {/* Answer Section */}
                <div className="mb-6">
                  {isSubmitted ? (
                    <div>
                      <h5 className="text-gray-600 font-medium mb-3">
                        {assignment.question.includes("4 elements")
                          ? "Four Key Elements of Service Design"
                          : "Answer:"}
                      </h5>
                      <div className="text-gray-700 leading-relaxed">
                        {assignment.question.includes("4 elements") ? (
                          <div className="space-y-2">
                            <div className="ml-4">• People.</div>
                            <div className="ml-4">• Processes.</div>
                            <div className="ml-4">• Products.</div>
                            <div className="ml-4">• Partners.</div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-line">
                            {currentAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={currentAnswer}
                      onChange={(e) =>
                        handleAnswerChange(assignment.id, e.target.value)
                      }
                      placeholder="Answer..."
                      className="w-full h-32 p-4 border border-gray-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  {!isSubmitted && (
                    <button
                      onClick={() => handleSubmit(assignment.id)}
                      className="px-6 py-4 bg-[#2F5FAC] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Assignment
                    </button>
                  )}
                 
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-b2 text-muted-foreground">
          No assignment for this lesson.
        </p>
      )}
    </div>
  );
}
