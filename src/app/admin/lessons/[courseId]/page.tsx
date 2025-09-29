"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SubLessonForm } from "@/components/course/SubLessonForm";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Lesson {}

export default function AddLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lessonName, setLessonName] = useState("");
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [subLessons, setSubLessons] = useState<{ id: number; name: string; file: File | null; previewUrl?: string | null; }[]>([
    { id: 1, name: "", file: null, previewUrl: null },
  ]);
  const [lessonId, setLessonId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) return;
        const data = await res.json();
        setCourseTitle(data?.title || "");
      } catch {
        // noop
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleCancel = () => {
    router.push(`/admin/courses/${courseId}/edit`);
  };

  const handleDeleteLesson = async () => {
    if (!lessonId) {
      alert('No lesson to delete');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let message = 'Failed to delete lesson';
        try {
          const errorData = await response.json();
          message = errorData?.error || message;
        } catch {}
        throw new Error(message);
      }

      // Redirect back to course edit page
      router.push(`/admin/courses/${courseId}/edit`);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete lesson: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!lessonName.trim()) {
      setErrors(prev => ({ ...prev, lessonName: "Please enter lesson name" }));
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload selected videos first
      const uploadedSubLessons = await Promise.all(
        subLessons.map(async (s) => {
          if (s.file) {
            const formData = new FormData();
            formData.append("file", s.file);
            formData.append("bucket", "attachments");
            formData.append("folder", "videos");

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) {
              let msg = "Upload failed";
              try { const b = await res.json(); msg = b?.error || msg; } catch {}
              throw new Error(msg);
            }
            const { url } = await res.json();
            return { title: s.name || "Untitled", video_url: url };
          }
          return { title: s.name || "Untitled", video_url: null };
        })
      );

      // Create module + lessons
      const createRes = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: Number(courseId),
          lessonTitle: lessonName.trim(),
          subLessons: uploadedSubLessons,
        }),
      });

      if (!createRes.ok) {
        let msg = "Failed to create lessons";
        try { const b = await createRes.json(); msg = b?.error || msg; } catch {}
        throw new Error(msg);
      }

      router.push(`/admin/courses/${courseId}/edit`);
    } catch (e: any) {
      alert(e?.message || "Failed to create lessons");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ArrowLeft
                className="h-[24px] w-[24px] text-[#9AA1B9] cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => router.push(`/admin/courses/${courseId}/edit`)}
              />
              <span className="text-[#9AA1B9] font-inter font-normal text-sm leading-[150%] tracking-normal align-middle">Course</span>
              {courseTitle && (
                <span className="text-[#2A2E3F] font-inter font-normal text-sm leading-[150%] tracking-normal align-middle">{courseTitle}</span>
              )}
            </div>
            <span className="text-black font-inter font-bold text-2xl leading-[125%] tracking-[-0.02em] align-middle">Add Lesson</span>
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
              onClick={handleCreate}
              disabled={isSubmitting}
              className="w-[119px] h-[60px] px-8 py-[18px] gap-[10px] rounded-xl bg-[#2F5FAC] text-white shadow-[4px_4px_24px_0px_#00000014] opacity-100 text-center font-inter font-bold text-base leading-[150%] tracking-normal hover:bg-[#2F5FAC] hover:text-white cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <SubLessonForm
            lessonName={lessonName}
            onLessonNameChange={(v) => {
              setLessonName(v);
              if (errors.lessonName) {
                setErrors(prev => ({ ...prev, lessonName: "" }));
              }
            }}
            subLessons={subLessons}
            onSubLessonsChange={setSubLessons}
            errors={errors}
            onDeleteLesson={lessonId ? handleDeleteLesson : undefined}
            isDeleting={isSubmitting}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


