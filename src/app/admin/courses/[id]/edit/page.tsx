"use client";

import { useEffect, useRef, useState } from "react";
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
import { AlertCircle, Loader2 } from "lucide-react";
import { CourseInformation } from "@/components/course/CourseInformation";
import { PromoCodeSection } from "@/components/course/PromoCodeSection";
import { FileUploadSection } from "@/components/course/FileUploadSection";
import { LessonManagement } from "@/components/course/LessonManagement";
import { DEFAULT_LESSONS } from "@/lib/constants";
import { validateCourseForm } from "@/lib/formUtils";

interface CourseFormData {
  title: string;
  price: string;
  duration_hours: string;
  category: string;
  summary: string;
  description: string;
  instructor: string;
  thumbnail: File | null;
  video_url: File | null;
  attachedFile: File | null;
}

interface PromoCode {
  enabled: boolean;
  code: string;
  minPurchaseAmount: string;
  discountType: "amount" | "percentage";
  discountValue: string;
}

interface Lesson {
  id: number;
  name: string;
  subLessons: number;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    price: "",
    duration_hours: "",
    category: "",
    summary: "",
    description: "",
    instructor: "",
    thumbnail: null,
    video_url: null,
    attachedFile: null,
  });

  const [promoCode, setPromoCode] = useState<PromoCode>({
    enabled: true,
    code: "",
    minPurchaseAmount: "",
    discountType: "amount",
    discountValue: "",
  });

  const [lessons, setLessons] = useState<Lesson[]>(DEFAULT_LESSONS);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        if (!courseId) throw new Error("Missing course id in route");
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) {
          let serverMsg = "";
          try {
            const body = await res.json();
            serverMsg = body?.error || JSON.stringify(body);
          } catch {}
          console.error("Failed to load course", {
            courseId,
            status: res.status,
            statusText: res.statusText,
            serverMsg,
          });
          throw new Error(serverMsg || `HTTP ${res.status} ${res.statusText}`);
        }
        const data = await res.json();

        if (!isMounted) return;

        setFormData(prev => ({
          ...prev,
          title: data?.title ?? "",
          price: data?.price != null ? String(data.price) : "",
          duration_hours: data?.duration_hours != null ? String(data.duration_hours) : "",
          category: data?.category ?? "",
          summary: data?.summary ?? "",
          description: data?.description ?? "",
          instructor: data?.instructor ?? "",
        }));

        setUploadedThumbnailUrl(data?.thumbnail ?? null);
        setUploadedVideoUrl(data?.video_url ?? null);

        // Optionally map modules->lessons if needed later; keep defaults for now
      } catch (e) {
        console.error(e);
        const msg = e instanceof Error ? e.message : "Unknown error";
        alert(`Failed to load course data: ${msg}`);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (courseId) fetchCourse();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const { isValid, newErrors } = validateCourseForm(formData, lessons, errors, {
      allowExistingMedia: true,
      existingThumbnailUrl: uploadedThumbnailUrl,
      existingVideoUrl: uploadedVideoUrl,
    });
    setErrors(newErrors);
    return isValid;
  };

  const handlePromoCodeChange = (field: keyof PromoCode, value: string | boolean) => {
    setPromoCode(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLessonsChange = (newLessons: Lesson[]) => {
    setLessons(newLessons);
    if (errors.lessons) {
      setErrors(prev => ({ ...prev, lessons: "" }));
    }
  };

  const handleFileUpload = (field: "thumbnail" | "video_url" | "attachedFile", file: File) => {
    setFormData(prev => ({
      ...prev,
      [field]: file,
    }));
    if (field === "thumbnail") {
      if (previewThumbnailUrl) URL.revokeObjectURL(previewThumbnailUrl);
      setPreviewThumbnailUrl(URL.createObjectURL(file));
      setIsUploadingThumbnail(true);
      uploadFile(file, "thumbnails")
        .then(url => {
          if (url) setUploadedThumbnailUrl(url);
        })
        .finally(() => setIsUploadingThumbnail(false));
    }
    if (field === "video_url") {
      if (previewVideoUrl) URL.revokeObjectURL(previewVideoUrl);
      setPreviewVideoUrl(URL.createObjectURL(file));
      setIsUploadingVideo(true);
      uploadFile(file, "videos")
        .then(url => {
          if (url) setUploadedVideoUrl(url);
        })
        .finally(() => setIsUploadingVideo(false));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "attachments");
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Upload failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error("File upload error:", error);
      alert(`File upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  };

  const clearThumbnail = () => {
    if (previewThumbnailUrl) URL.revokeObjectURL(previewThumbnailUrl);
    setPreviewThumbnailUrl(null);
    setUploadedThumbnailUrl(null);
    setFormData(prev => ({ ...prev, thumbnail: null }));
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const clearVideo = () => {
    if (previewVideoUrl) URL.revokeObjectURL(previewVideoUrl);
    setPreviewVideoUrl(null);
    setUploadedVideoUrl(null);
    setFormData(prev => ({ ...prev, video_url: null }));
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let thumbnailUrl = uploadedThumbnailUrl;
      let videoUrl = uploadedVideoUrl;

      if (!thumbnailUrl && formData.thumbnail) {
        thumbnailUrl = await uploadFile(formData.thumbnail, "thumbnails");
      }
      if (!videoUrl && formData.video_url) {
        videoUrl = await uploadFile(formData.video_url, "videos");
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        summary: formData.summary,
        price: parseFloat(formData.price),
        currency: "THB",
        category: formData.category || "general",
        duration_hours: parseFloat(formData.duration_hours),
        instructor: formData.instructor || null,
        thumbnail: thumbnailUrl,
        video_url: videoUrl,
      };

      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        let message = "Failed to update course";
        try {
          const errorData = await response.json();
          message = errorData?.error || message;
        } catch {}
        throw new Error(message);
      }

      await response.json();
      router.push("/admin/courses");
    } catch (error) {
      console.error("Error updating course:", error);
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to update course: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/courses");
  };

  const handleDelete = async () => {
    if (!courseId) {
      alert("Missing course id");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!res.ok) {
        let message = "Failed to delete course";
        try {
          const body = await res.json();
          message = body?.error || message;
        } catch {}
        throw new Error(message);
      }
      router.push("/admin/courses");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      alert(`Delete failed: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-h3 font-semibold">Edit Course</h1>

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
                "Edit"
              )}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-8">
            <CourseInformation
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />

            <PromoCodeSection
              promoCode={promoCode}
              onPromoCodeChange={handlePromoCodeChange}
            />

            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Course summary <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="Enter course summary"
                  className={`w-full h-[72px] p-3 pr-10 border rounded-lg resize-none focus:ring-2 ${
                    errors.summary
                      ? "border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                />
                {errors.summary && (
                  <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                )}
              </div>
              {errors.summary && (
                <p className="text-[#9B2FAC] text-sm mt-1">{errors.summary}</p>
              )}
            </div>

            <div>
              <label className="block text-b3 font-medium text-gray-700 mb-2">
                Course detail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  placeholder="Enter course detail"
                  className={`w-full h-[192px] p-3 pr-10 border rounded-lg resize-none focus:ring-2 ${
                    errors.description
                      ? "border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
                {errors.description && (
                  <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                )}
              </div>
              {errors.description && (
                <p className="text-[#9B2FAC] text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <FileUploadSection
              formData={formData}
              errors={errors}
              previewThumbnailUrl={previewThumbnailUrl}
              previewVideoUrl={previewVideoUrl}
              uploadedThumbnailUrl={uploadedThumbnailUrl}
              uploadedVideoUrl={uploadedVideoUrl}
              isUploadingThumbnail={isUploadingThumbnail}
              isUploadingVideo={isUploadingVideo}
              onFileUpload={handleFileUpload}
              onClearThumbnail={clearThumbnail}
              onClearVideo={clearVideo}
            />
          </div>

          <LessonManagement
            lessons={lessons}
            errors={errors}
            onLessonsChange={handleLessonsChange}
          />
          {/* Bottom actions */}
          <div className="max-w-4xl mx-auto mt-6 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="p-0 m-0 bg-transparent border-0 text-[#2F5FAC] font-inter font-bold text-base leading-[150%] tracking-normal cursor-pointer"
                >
                  Delete Course
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
                    Are you sure you want to delete this course?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pb-6 pt-2 px-6 flex gap-3 !justify-center">
                  <AlertDialogAction
                    asChild
                    className="h-15 w-2/3 border border-orange-500 !text-orange-500 bg-transparent hover:bg-orange-100 px-4 py-2 rounded-lg text-b2 font-medium"
                  >
                    <button onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Yes, I want to delete this course"}
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


