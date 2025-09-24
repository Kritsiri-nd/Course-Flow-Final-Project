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
import { Label } from "@/components/ui/label";
import { assignmentService } from "@/services/assignmentService";
import { AlertCircle, Loader2 } from "lucide-react";

// Define types based on the actual API structure
interface Lesson {
  id: number;
  title: string;
  order_index: number;
  created_at: string;
}

interface Module {
  id: number;
  title: string;
  order_index: number;
  created_at: string;
  lessons: Lesson[];
}

interface Course {
  id: number;
  title: string;
  category: string;
  modules: Module[];
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    course: "",
    lesson: "",
    subLesson: "",
    assignment: "",
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

  const handleInputChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    if (field === "course") {
      const course = courses.find(c => c.id.toString() === value);
      setSelectedCourse(course || null);
      
      // Flatten all lessons from all modules of the selected course
      const lessons = course?.modules.flatMap(module => module.lessons) || [];
      setAllLessons(lessons);
      
      setFormData(prev => ({
        ...prev,
        [field]: value,
        lesson: "",
        subLesson: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assignment.trim()) {
      newErrors.assignment = "Please enter assignment details";
    }

    if (!formData.course) {
      newErrors.course = "Please select a course";
    }

    if (!formData.lesson) {
      newErrors.lesson = "Please select a lesson";
    }

    if (!formData.subLesson) {
      newErrors.subLesson = "Please select a sub-lesson";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const selectedLesson = allLessons.find(l => l.id.toString() === formData.lesson);
      
      console.log("Creating assignment with data:", {
        question: formData.assignment,
        answer: "",
        lesson_id: formData.lesson,
        course: selectedCourse?.title,
        lesson: selectedLesson?.title,
        sub_lesson: formData.subLesson,
      });

      const result = await assignmentService.createAssignment({
        question: formData.assignment,
        answer: "",
        lesson_id: formData.lesson,
      });
      
      console.log("Assignment created successfully:", result);
      
      // Success - redirect to assignments list
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
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Selection */}
              <div className="space-y-2">
                <Label htmlFor="course" className="block text-b3 font-medium text-gray-700">
                  Course <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="course"
                    value={formData.course}
                    onChange={(e) => handleInputChange("course", e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 ${
                      errors.course 
                        ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' 
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    disabled={loading}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.category})
                      </option>
                    ))}
                  </select>
                  {errors.course && (
                    <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                  )}
                </div>
                {errors.course && (
                  <p className="text-[#9B2FAC] text-sm mt-1">{errors.course}</p>
                )}
              </div>

              {/* Lesson and Sub-lesson Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lesson" className="block text-b3 font-medium text-gray-700">
                    Lesson <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="lesson"
                      value={formData.lesson}
                      onChange={(e) => handleInputChange("lesson", e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 ${
                        errors.lesson 
                          ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' 
                          : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                      }`}
                      disabled={loading || !selectedCourse}
                      required
                    >
                      <option value="">Select a lesson</option>
                      {allLessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                    {errors.lesson && (
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                    )}
                  </div>
                  {errors.lesson && (
                    <p className="text-[#9B2FAC] text-sm mt-1">{errors.lesson}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subLesson" className="block text-b3 font-medium text-gray-700">
                    Sub-lesson <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="subLesson"
                      value={formData.subLesson}
                      onChange={(e) => handleInputChange("subLesson", e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 ${
                        errors.subLesson 
                          ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' 
                          : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                      }`}
                      disabled={loading}
                      required
                    >
                      <option value="">Select a sub-lesson</option>
                      <option value="1">Introduction</option>
                      <option value="2">Basic Concepts</option>
                      <option value="3">Advanced Topics</option>
                      <option value="4">Practical Exercises</option>
                      <option value="5">Final Project</option>
                    </select>
                    {errors.subLesson && (
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                    )}
                  </div>
                  {errors.subLesson && (
                    <p className="text-[#9B2FAC] text-sm mt-1">{errors.subLesson}</p>
                  )}
                </div>
              </div>

              {/* Assignment Detail Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Assignment detail</h3>
                <div className="space-y-2">
                  <Label htmlFor="assignment" className="block text-b3 font-medium text-gray-700">
                    Assignment <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <textarea
                      id="assignment"
                      value={formData.assignment}
                      onChange={(e) => handleInputChange("assignment", e.target.value)}
                      placeholder="Enter assignment details..."
                      rows={6}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg resize-none focus:ring-2 ${
                        errors.assignment 
                          ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' 
                          : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                      }`}
                      required
                      disabled={loading}
                    />
                    {errors.assignment && (
                      <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                    )}
                  </div>
                  {errors.assignment && (
                    <p className="text-[#9B2FAC] text-sm mt-1">{errors.assignment}</p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 