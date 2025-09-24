"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Assignment } from "@/types";

interface AssignmentFormData {
  question: string;
  answer: string;
  lesson_id: string;
}

interface Course {
  id: number;
  title: string;
  modules: Module[];
}

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
}

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params?.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  const [formData, setFormData] = useState<AssignmentFormData>({
    question: "",
    answer: "",
    lesson_id: "",
  });

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch assignment data
  useEffect(() => {
    let isMounted = true;
    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        if (!assignmentId) throw new Error("Missing assignment id in route");
        
        console.log("Fetching assignment with ID:", assignmentId);
        
        const response = await fetch(`/api/assignments/${assignmentId}`);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          let errorMessage = "Assignment not found";
          try {
            // Check if response has JSON body
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } else {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
          } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError);
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          console.error("API Error:", errorMessage);
          throw new Error(errorMessage);
        }
        
        const assignmentData = await response.json();
        console.log("Assignment data:", assignmentData);

        if (!isMounted) return;

        setAssignment(assignmentData);
        setFormData({
          question: assignmentData.question || "",
          answer: assignmentData.answer || "",
          lesson_id: assignmentData.lesson_id?.toString() || "",
        });

        // Set selected values for dropdowns
        if (assignmentData.lesson?.module?.course?.id) {
          setSelectedCourseId(assignmentData.lesson.module.course.id.toString());
        }
        if (assignmentData.lesson?.module?.id) {
          setSelectedModuleId(assignmentData.lesson.module.id.toString());
        }
        if (assignmentData.lesson?.id) {
          setSelectedLessonId(assignmentData.lesson.id.toString());
        }
      } catch (e) {
        console.error("Error in fetchAssignment:", e);
        const msg = e instanceof Error ? e.message : "Unknown error";
        alert(`Failed to load assignment data: ${msg}`);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (assignmentId) fetchAssignment();
    return () => {
      isMounted = false;
    };
  }, [assignmentId]);

  const handleInputChange = (field: keyof AssignmentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedModuleId("");
    setSelectedLessonId("");
    setFormData(prev => ({ ...prev, lesson_id: "" }));
  };

  const handleModuleChange = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId("");
    setFormData(prev => ({ ...prev, lesson_id: "" }));
  };

  const handleLessonChange = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setFormData(prev => ({ ...prev, lesson_id: lessonId }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.question.trim()) {
      newErrors.question = "Assignment question is required";
    }

    if (!selectedCourseId) {
      newErrors.course_id = "Please select a course";
    }

    if (!selectedModuleId) {
      newErrors.lesson_id = "Please select a lesson";
    }

    if (!selectedLessonId) {
      newErrors.sub_lesson = "Please select a sub-lesson";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          lesson_id: parseInt(formData.lesson_id),
        }),
      });

      if (!response.ok) {
        let message = "Failed to update assignment";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            message = errorData?.error || message;
          } else {
            message = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch {}
        throw new Error(message);
      }

      await response.json();
      router.push("/admin/assignments");
    } catch (error) {
      console.error("Error updating assignment:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to update assignment: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/assignments");
  };

  const handleDelete = async () => {
    if (!assignmentId) {
      alert("Missing assignment id");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`, { method: "DELETE" });
      if (!res.ok) {
        let message = "Failed to delete assignment";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const body = await res.json();
            message = body?.error || message;
          } else {
            message = `HTTP ${res.status}: ${res.statusText}`;
          }
        } catch {}
        throw new Error(message);
      }
      router.push("/admin/assignments");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      alert(`Delete failed: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get selected course
  const selectedCourse = courses.find(c => c.id.toString() === selectedCourseId);
  
  // Get selected module
  const selectedModule = selectedCourse?.modules.find(m => m.id.toString() === selectedModuleId);
  
  // Get selected lesson
  const selectedLesson = selectedModule?.lessons.find(l => l.id.toString() === selectedLessonId);

  if (isLoading) {
    return (
      <SidebarProvider>
        <AdminPanel />
        <SidebarInset className="bg-gray-100">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-gray-500">Assignment</span>
            <h1 className="text-h3 font-semibold">{assignment?.question || "Edit Assignment"}</h1>
          </div>

          <div className="ml-auto gap-4 flex items-center">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-[119px] h-[60px] px-8 py-[18px] gap-[10px] rounded-xl border border-[#F47E20] text-[#F47E20] shadow-[4px_4px_24px_0px_#00000014] opacity-100 text-center font-inter font-bold text-base leading-[150%] tracking-normal hover:bg-transparent hover:text-[#F47E20] cursor-pointer disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-[119px] h-[60px] px-8 py-[18px] gap-[10px] rounded-xl bg-[#2F5FAC] text-white shadow-[4px_4px_24px_0px_#00000014] opacity-100 text-center font-inter font-bold text-base leading-[150%] tracking-normal hover:bg-[#2F5FAC] hover:text-white cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Course
              </label>
              <div className="relative">
                <select
                  className={`w-full h-12 p-3 pr-10 border rounded-lg focus:ring-2 ${
                    errors.course_id
                      ? "border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {errors.course_id && (
                  <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                )}
              </div>
              {errors.course_id && (
                <p className="text-[#9B2FAC] text-sm mt-1">{errors.course_id}</p>
              )}
            </div>

            {/* Module Selection (Lesson in table) */}
            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Lesson
              </label>
              <div className="relative">
                <select
                  className={`w-full h-12 p-3 pr-10 border rounded-lg focus:ring-2 ${
                    errors.lesson_id
                      ? "border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                  value={selectedModuleId}
                  onChange={(e) => handleModuleChange(e.target.value)}
                  disabled={!selectedCourse}
                >
                  <option value="">Select Lesson</option>
                  {selectedCourse?.modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
                {errors.lesson_id && (
                  <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                )}
              </div>
              {errors.lesson_id && (
                <p className="text-[#9B2FAC] text-sm mt-1">{errors.lesson_id}</p>
              )}
            </div>

            {/* Sub-lesson Selection (Sub-lesson in table) */}
            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Sub-lesson
              </label>
              <div className="relative">
                <select
                  className={`w-full h-12 p-3 pr-10 border rounded-lg focus:ring-2 ${
                    errors.sub_lesson
                      ? "border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                  value={selectedLessonId}
                  onChange={(e) => handleLessonChange(e.target.value)}
                  disabled={!selectedModule}
                >
                  <option value="">Select Sub-lesson</option>
                  {selectedModule?.lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                {errors.sub_lesson && (
                  <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                )}
              </div>
              {errors.sub_lesson && (
                <p className="text-[#9B2FAC] text-sm mt-1">{errors.sub_lesson}</p>
              )}
            </div>

            {/* Assignment Detail */}
            <div>
              <h3 className="text-b1 font-bold text-gray-700 mb-4">Assignment detail</h3>
              <div>
                <label className="block text-b3 font-medium text-gray-700 mb-2">
                  Assignment <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Enter assignment question"
                    className={`w-full h-32 p-3 pr-10 border rounded-lg resize-none focus:ring-2 ${
                      errors.question
                        ? "border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]"
                        : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                    }`}
                    value={formData.question}
                    onChange={(e) => handleInputChange("question", e.target.value)}
                  />
                  {errors.question && (
                    <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                  )}
                </div>
                {errors.question && (
                  <p className="text-[#9B2FAC] text-sm mt-1">{errors.question}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="max-w-4xl mx-auto mt-6 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="p-0 m-0 bg-transparent border-0 text-[#2F5FAC] font-inter font-bold text-base leading-[150%] tracking-normal cursor-pointer"
                >
                  Delete Assignment
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md p-0 !rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-b1 font-medium h-14 border-b border-gray-300 py-4 px-6 flex justify-between items-center">
                    Confirmation
                    <AlertDialogCancel
                      asChild
                      className="!border-none !bg-none !shadow-none"
                    >
                      <button className="text-gray-500">×</button>
                    </AlertDialogCancel>
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-b2 text-gray-700 pt-4 px-6">
                    Are you sure you want to delete this assignment?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pb-6 pt-2 px-6 flex gap-3 !justify-center">
                  <AlertDialogAction
                    asChild
                    className="h-15 w-2/3 border border-orange-500 !text-orange-500 bg-transparent hover:bg-orange-100 px-4 py-2 rounded-lg text-b2 font-medium"
                  >
                    <button onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Yes, I want to delete this assignment"}
                    </button>
                  </AlertDialogAction>
                  <AlertDialogCancel className="h-15 w-1/3 bg-[#2F5FAC] hover:bg-[#2F5FAC] !text-white px-4 py-2 rounded-lg text-b2 font-medium">
                    No, keep it
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
