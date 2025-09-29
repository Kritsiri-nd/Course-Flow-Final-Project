"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SubLessonForm } from "@/components/course/SubLessonForm";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Lesson {}

type SubLessonState = { id: number; name: string; file: File | null; previewUrl?: string | null; existingUrl?: string | null };

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const moduleId = params?.id as string;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonName, setLessonName] = useState("");
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [subLessons, setSubLessons] = useState<SubLessonState[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!courseId || !moduleId) return;
      try {
        setIsLoading(true);
        const [courseRes, moduleRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch(`/api/lessons/${moduleId}`),
        ]);
        if (courseRes.ok) {
          const c = await courseRes.json();
          setCourseTitle(c?.title || "");
        }
        if (!moduleRes.ok) throw new Error("Failed to load lesson");
        const m = await moduleRes.json();
        setLessonName(m?.title || "");
        const mapped: SubLessonState[] = (m?.lessons || []).map((l: any, idx: number) => ({
          id: typeof l?.id === "number" ? l.id : idx + 1,
          name: l?.title || "",
          file: null,
          previewUrl: l?.video_url || null,
          existingUrl: l?.video_url || null,
        }));
        setSubLessons(mapped.length ? mapped : [{ id: 1, name: "", file: null, previewUrl: null }]);
      } catch (e) {
        console.error(e);
        alert("Failed to load lesson data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [courseId, moduleId]);

  const handleCancel = () => {
    router.push(`/admin/courses/${courseId}/edit`);
  };

  const handleSave = async () => {
    if (!lessonName.trim()) {
      setErrors(prev => ({ ...prev, lessonName: "Please enter lesson name" }));
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload newly selected videos and preserve existing URLs
      const uploadedSubLessons = await Promise.all(
        subLessons.map(async (s) => {
          // If a new file picked, upload; else keep existingUrl if present
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
          return { title: s.name || "Untitled", video_url: s.existingUrl ?? null };
        })
      );

      const updateRes = await fetch(`/api/lessons/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: Number(courseId),
          lessonTitle: lessonName.trim(),
          subLessons: uploadedSubLessons,
        }),
      });

      if (!updateRes.ok) {
        let msg = "Failed to update lessons";
        try { const b = await updateRes.json(); msg = b?.error || msg; } catch {}
        throw new Error(msg);
      }

      router.push(`/admin/courses/${courseId}/edit`);
    } catch (e: any) {
      alert(e?.message || "Failed to update lessons");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-black font-inter font-bold text-2xl leading-[125%] tracking-[-0.02em] align-middle">Edit Lesson</span>
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
              onClick={handleSave}
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
          <SubLessonForm
            lessonName={lessonName}
            onLessonNameChange={(v) => {
              setLessonName(v);
              if (errors.lessonName) {
                setErrors(prev => ({ ...prev, lessonName: "" }));
              }
            }}
            subLessons={subLessons}
            onSubLessonsChange={(items) => setSubLessons(items as SubLessonState[])}
            errors={errors}
            moduleId={moduleId}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


