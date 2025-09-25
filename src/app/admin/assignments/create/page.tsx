"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

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

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<AssignmentFormData>({
    question: "",
    answer: "",
    lesson_id: "",
  });

  // Fetch courses from API
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

    setLoading(true);
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          lesson_id: parseInt(formData.lesson_id),
        }),
      });

      if (!response.ok) {
        let message = "Failed to create assignment";
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
      console.error("Error creating assignment:", error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Failed to create assignment: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/assignments");
  };

  // Get selected course
  const selectedCourse = courses.find(c => c.id.toString() === selectedCourseId);
  
  // Get selected module
  const selectedModule = selectedCourse?.modules.find(m => m.id.toString() === selectedModuleId);
  
  // Get selected lesson
  const selectedLesson = selectedModule?.lessons.find(l => l.id.toString() === selectedLessonId);

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        {/* Header */}
        <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-h3 font-semibold">Add Assignment</h1>
          
          {/* Action Buttons */}
          <div className="ml-auto gap-4 flex items-center">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-[119px] h-[60px] px-8 py-[18px] gap-[10px] rounded-xl border border-[#F47E20] text-[#F47E20] shadow-[4px_4px_24px_0px_#00000014] opacity-100 text-center font-inter font-bold text-base leading-[150%] tracking-normal hover:bg-transparent hover:text-[#F47E20] cursor-pointer disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={loading}
              className="w-[119px] h-[60px] px-8 py-[18px] gap-[10px] rounded-xl bg-[#2F5FAC] text-white shadow-[4px_4px_24px_0px_#00000014] opacity-100 text-center font-inter font-bold text-base leading-[150%] tracking-normal hover:bg-[#2F5FAC] hover:text-white cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Course <span className="text-red-500">*</span>
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
                  <option value="">Select a Course</option>
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
                Lesson <span className="text-red-500">*</span>
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
                Sub-lesson <span className="text-red-500">*</span>
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}