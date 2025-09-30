"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { CourseInformation } from "@/components/course/CourseInformation";
import { PromoCodeSection } from "@/components/course/PromoCodeSection";
import { FileUploadSection } from "@/components/course/FileUploadSection";
import { LessonManagement } from "@/components/course/LessonManagement";
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

export default function AddCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const clearThumbnail = () => {
    if (previewThumbnailUrl) URL.revokeObjectURL(previewThumbnailUrl);
    setPreviewThumbnailUrl(null);
    setUploadedThumbnailUrl(null);
    setFormData(prev => ({ ...prev, thumbnail: null }));
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const clearVideo = () => {
    if (previewVideoUrl) URL.revokeObjectURL(previewVideoUrl);
    setPreviewVideoUrl(null);
    setUploadedVideoUrl(null);
    setFormData(prev => ({ ...prev, video_url: null }));
    if (videoInputRef.current) videoInputRef.current.value = '';
  };
  
  // Form data state
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

  // Promo code state
  const [promoCode, setPromoCode] = useState<PromoCode>({
    enabled: true,
    code: "",
    minPurchaseAmount: "",
    discountType: "amount",
    discountValue: "",
  });

  // Lessons state
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // File input refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Handle form input changes
  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };


  // Validate form
  const validateForm = (): boolean => {
    const { isValid, newErrors } = validateCourseForm(formData, lessons, errors, {
      skipLessonValidation: true,
    });
    setErrors(newErrors);
    return isValid;
  };

  // Handle promo code changes
  const handlePromoCodeChange = (field: keyof PromoCode, value: string | boolean) => {
    setPromoCode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle lessons change
  const handleLessonsChange = (newLessons: Lesson[]) => {
    setLessons(newLessons);
    // Clear lesson error if it exists
    if (errors.lessons) {
      setErrors(prev => ({
        ...prev,
        lessons: ''
      }));
    }
  };

  // Handle file uploads
  const handleFileUpload = (field: 'thumbnail' | 'video_url' | 'attachedFile', file: File) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
    // Set local preview for immediate feedback
    if (field === 'thumbnail') {
      if (previewThumbnailUrl) URL.revokeObjectURL(previewThumbnailUrl);
      setPreviewThumbnailUrl(URL.createObjectURL(file));
      // Begin upload immediately
      setIsUploadingThumbnail(true);
      uploadFile(file, 'thumbnails')
        .then((url) => {
          if (url) setUploadedThumbnailUrl(url);
        })
        .finally(() => setIsUploadingThumbnail(false));
    }
    if (field === 'video_url') {
      if (previewVideoUrl) URL.revokeObjectURL(previewVideoUrl);
      setPreviewVideoUrl(URL.createObjectURL(file));
      // Begin upload immediately
      setIsUploadingVideo(true);
      uploadFile(file, 'videos')
        .then((url) => {
          if (url) setUploadedVideoUrl(url);
        })
        .finally(() => setIsUploadingVideo(false));
    }
    // Clear error when file is selected
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Upload file to Supabase storage (single bucket 'attachments', organized by folder)
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'attachments');
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('File upload error:', error);
      alert(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  // Submit form
  const handleSubmit = async () => {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {

      // Upload files if they exist
      let thumbnailUrl = uploadedThumbnailUrl;
      let videoUrl = uploadedVideoUrl;
      
      if (!thumbnailUrl && formData.thumbnail) {
        thumbnailUrl = await uploadFile(formData.thumbnail, 'thumbnails');
      }
      
      if (!videoUrl && formData.video_url) {
        videoUrl = await uploadFile(formData.video_url, 'videos');
      }

      // Prepare course data for API
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
        lessons: lessons, // Include lessons data
      };

      // Submit to API
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        let message = 'Failed to create course';
        try {
          const errorData = await response.json();
          message = errorData?.error || message;
        } catch {}
        throw new Error(message);
      }

      const result = await response.json();
      console.log('Course created successfully:', result);
      
      // Redirect to courses list or show success message
      router.push('/admin/courses');
      
    } catch (error) {
      console.error('Error creating course:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create course: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/admin/courses');
  };

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        {/* header */}
        <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-h3 font-semibold">Add Course</h1>

          {/* cancel & create buttons */}
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
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-8">
            
            {/* Course Information */}
            <CourseInformation 
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />

              {/* Promo Code */}
            <PromoCodeSection 
              promoCode={promoCode}
              onPromoCodeChange={handlePromoCodeChange}
            />

              {/* Course Summary */}
              <div>
                <label className="block text-b3 font-medium text-gray-700 mb-2">
                  Course summary <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Enter course summary"
                    className={`w-full h-[72px] p-3 pr-10 border rounded-lg resize-none focus:ring-2 ${
                      errors.summary 
                        ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' 
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                  />
                {errors.summary && (
                  <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                )}
                </div>
                {errors.summary && (
                  <p className="text-[#9B2FAC] text-sm mt-1">{errors.summary}</p>
                )}
              </div>

              {/* Course Detail */}
              <div>
                <label className="block text-b3 font-medium text-gray-700 mb-2">
                  Course detail <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Enter course detail"
                    className={`w-full h-[192px] p-3 pr-10 border rounded-lg resize-none focus:ring-2 ${
                      errors.description 
                        ? 'border-[#9B2FAC] focus:border-[#9B2FAC] focus:ring-[#9B2FAC]' 
                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                      }`}
                      value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                {errors.description && (
                  <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-[#9B2FAC]" />
                )}
                </div>
                {errors.description && (
                  <p className="text-[#9B2FAC] text-sm mt-1">{errors.description}</p>
                )}
              </div>
              

            {/* File Upload Section */}
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

        {/* Lesson Management (mock-only on create) */}
        <LessonManagement
          lessons={lessons}
          errors={errors}
          onLessonsChange={handleLessonsChange}
          mockOnly
        />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}