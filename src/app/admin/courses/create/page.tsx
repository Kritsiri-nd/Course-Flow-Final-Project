"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Upload, Trash2, Edit, GripVertical, Loader2 } from "lucide-react";

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
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: 1, name: "Introduction", subLessons: 10 },
    { id: 2, name: "Service Design Theories and Principles", subLessons: 10 },
    { id: 3, name: "Understanding Users and Finding Opportunities", subLessons: 10 },
    { id: 4, name: "Identifying and Validating Opportunities for Design", subLessons: 10 },
    { id: 5, name: "Prototyping", subLessons: 10 },
    { id: 6, name: "Course Summary", subLessons: 10 },
  ]);

  // File input refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid number greater than 0';
    }

    if (!formData.duration_hours.trim()) {
      newErrors.duration_hours = 'Duration is required';
    } else if (isNaN(Number(formData.duration_hours)) || Number(formData.duration_hours) <= 0) {
      newErrors.duration_hours = 'Duration must be a valid number greater than 0';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Course summary is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course detail is required';
    }

    if (!formData.thumbnail) {
      newErrors.thumbnail = 'Cover image is required';
    }

    if (!formData.video_url) {
      newErrors.video_url = 'Video trailer is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle promo code changes
  const handlePromoCodeChange = (field: keyof PromoCode, value: string | boolean) => {
    setPromoCode(prev => ({
      ...prev,
      [field]: value
    }));
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
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        };
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
            <div>
                <h2 className="text-h3 font-semibold text-gray-900 mb-4">Course Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-b3 font-medium text-gray-700 mb-2">
                      Course name <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      placeholder="Enter course name" 
                      className={`w-full ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-b3 font-medium text-gray-700 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="Enter price in THB" 
                        className={`w-full ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-b3 font-medium text-gray-700 mb-2">
                        Total learning time (hours) <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="Enter duration in hours" 
                        className={`w-full ${errors.duration_hours ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        type="number"
                        value={formData.duration_hours}
                        onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                      />
                      {errors.duration_hours && (
                        <p className="text-red-500 text-sm mt-1">{errors.duration_hours}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-b3 font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <Input 
                        placeholder="Enter course category" 
                        className="w-full" 
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-b3 font-medium text-gray-700 mb-2">
                        Instructor
                      </label>
                      <Input 
                        placeholder="Enter instructor name" 
                        className="w-full" 
                        value={formData.instructor}
                        onChange={(e) => handleInputChange('instructor', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="promo-code"
                    checked={promoCode.enabled}
                    onChange={(e) => handlePromoCodeChange('enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="promo-code" className="text-b3 font-medium text-gray-700">
                    Promo code
                  </label>
                </div>
                
                {promoCode.enabled && (
                  <div className="bg-gray-100 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-b3 font-medium text-gray-700 mb-2">
                          Set promo code
                        </label>
                        <Input 
                          placeholder="Enter promo code" 
                          className="w-full" 
                          value={promoCode.code}
                          onChange={(e) => handlePromoCodeChange('code', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-b3 font-medium text-gray-700 mb-2">
                          Minimum purchase amount (THB)
                        </label>
                        <Input 
                          placeholder="0" 
                          className="w-full" 
                          type="number"
                          value={promoCode.minPurchaseAmount}
                          onChange={(e) => handlePromoCodeChange('minPurchaseAmount', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-b3 font-medium text-gray-700 mb-2">
                        Select discount type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="discount-amount"
                            name="discount-type"
                            value="amount"
                            checked={promoCode.discountType === "amount"}
                            onChange={(e) => handlePromoCodeChange('discountType', e.target.value as 'amount' | 'percentage')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="discount-amount" className="text-b3 font-medium text-gray-700 whitespace-nowrap">
                            Discount (THB)
                          </label>
                          <Input 
                            placeholder="200" 
                            className="w-full" 
                            type="number"
                            value={promoCode.discountType === 'amount' ? promoCode.discountValue : ''}
                            onChange={(e) => handlePromoCodeChange('discountValue', e.target.value)}
                            disabled={promoCode.discountType !== 'amount'}
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id="discount-percentage"
                            name="discount-type"
                            value="percentage"
                            checked={promoCode.discountType === "percentage"}
                            onChange={(e) => handlePromoCodeChange('discountType', e.target.value as 'amount' | 'percentage')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="discount-percentage" className="text-b3 font-medium text-gray-700 whitespace-nowrap">
                            Discount (%)
                          </label>
                          <Input 
                            placeholder="Enter percentage" 
                            className="w-full" 
                            type="number"
                            max="100"
                            value={promoCode.discountType === 'percentage' ? promoCode.discountValue : ''}
                            onChange={(e) => handlePromoCodeChange('discountValue', e.target.value)}
                            disabled={promoCode.discountType !== 'percentage'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Summary */}
              <div>
                <label className="block text-b3 font-medium text-gray-700 mb-2">
                  Course summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter course summary"
                  className={`w-full h-[72px] p-3 border rounded-lg resize-none focus:ring-2 ${
                    errors.summary 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                />
                {errors.summary && (
                  <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
                )}
              </div>

              {/* Course Detail */}
              <div>
                <label className="block text-b3 font-medium text-gray-700 mb-2">
                  Course detail <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter course detail"
                  className={`w-full h-[192px] p-3 border rounded-lg resize-none focus:ring-2 ${
                    errors.description 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                    value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              

              <div>
                {/* Cover Image */}
                <div>
                  <label className="block text-b3 font-medium text-gray-700 mb-2">
                    Cover image <span className="text-red-500">*</span>
                  </label>
                  <p className="text-b3 text-gray-500 mb-3">
                    Supported file types: .jpg, .png, .jpeg. Max file size: 5 MB
                  </p>
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('thumbnail', file);
                    }}
                    className="hidden"
                  />
                  <div 
                    className={`relative w-[240px] h-[240px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors border-2 border-dashed ${
                      errors.thumbnail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    {previewThumbnailUrl || uploadedThumbnailUrl ? (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        {/* Prefer uploaded URL once available */}
                        <img
                          src={(uploadedThumbnailUrl || previewThumbnailUrl) as string}
                          alt="Thumbnail preview"
                          className="max-w-full max-h-full object-contain rounded"
                        />
                      </div>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-blue-400 mb-2" />
                        <span className="text-b3 text-blue-400 font-medium">Upload Image</span>
                      </>
                    )}
                    {(previewThumbnailUrl || uploadedThumbnailUrl) && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearThumbnail(); }}
                        className="absolute top-2 right-2 flex items-center justify-center text-gray-500 text-[20px] font-bold leading-none"
                        aria-label="Remove image"
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {isUploadingThumbnail && (
                    <p className="text-xs text-gray-500 mt-1">Uploading image...</p>
                  )}
                  {errors.thumbnail && (
                    <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>
                  )}
                </div>

                {/* Video Trailer */}
                <div className="mt-6">
                  <label className="block text-b3 font-medium text-gray-700 mb-2">
                    Video Trailer <span className="text-red-500">*</span>
                  </label>
                  <p className="text-b3 text-gray-500 mb-3">
                    Supported file types: .mp4, .mov, .avi. Max file size: 20 MB
                  </p>
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('video_url', file);
                    }}
                    className="hidden"
                  />
                  <div 
                    className={`relative w-[240px] h-[240px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors border-2 border-dashed ${
                      errors.video_url ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    {previewVideoUrl || uploadedVideoUrl ? (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <video
                          src={(uploadedVideoUrl || previewVideoUrl) as string}
                          controls
                          className="max-w-full max-h-full rounded"
                        />
                      </div>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-blue-400 mb-2" />
                        <span className="text-b3 text-blue-400 font-medium">Upload Video</span>
                      </>
                    )}
                    {(previewVideoUrl || uploadedVideoUrl) && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearVideo(); }}
                        className="absolute top-2 right-2 flex items-center justify-center text-gray-500 text-[20px] font-bold leading-none"
                        aria-label="Remove video"
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {isUploadingVideo && (
                    <p className="text-xs text-gray-500 mt-1">Uploading video...</p>
                  )}
                  {errors.video_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.video_url}</p>
                  )}
                </div>

                {/* Attach File */}
                <div className="mt-6">
                  <label className="block text-b3 font-medium text-gray-700 mb-2">
                    Attach File (Optional)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('attachedFile', file);
                    }}
                    className="hidden"
                  />
                  <div 
                    className="w-[160px] h-[160px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors border-2 border-dashed border-gray-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.attachedFile ? (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-green-500 mb-2 mx-auto" />
                        <span className="text-b3 text-green-600 font-medium text-center">{formData.attachedFile.name}</span>
                        <p className="text-xs text-gray-500 mt-1">Click to change</p>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-blue-400 mb-2" />
                        <span className="text-b3 text-blue-400 font-medium">Upload File</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
          </div>

        {/* Lesson */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-sm mt-12 border border-gray-200 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-h3 font-medium text-[#2A2E3F] leading-[125%] tracking-[-2%]">Lesson</h2>
              <button
                type="button"
                onClick={() => {
                  // Handle add lesson action
                  console.log("Add lesson clicked");
                }}
                className="w-full sm:w-[171px] h-[60px] pt-[18px] pr-[32px] pb-[18px] pl-[32px] gap-[10px] rounded-[12px] bg-[#2F5FAC] text-white shadow-[4px_4px_24px_0px_#00000014] opacity-100 flex items-center justify-center transition-all duration-200 hover:bg-[#2F5FAC] hover:scale-105 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Lesson
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-300 border-none">
                  <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-12"></th>
                  <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700">Lesson name</th>
                  <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700">Sub-lesson</th>
                  <th className="px-4 py-3 text-left text-b3 font-medium text-gray-700 w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "Introduction",
                  "Service Design Theories and Principles",
                  "Understanding Users and Finding Opportunities",
                  "Identifying and Validating Opportunities for Design",
                  "Prototyping",
                  "Course Summary"
                ].map((lesson, idx) => (
                  <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-b3 text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-3 text-b3 text-gray-900">{lesson}</td>
                    <td className="px-4 py-3 text-b3 text-gray-900">10</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2H7v-2a2 2 0 012-2h2v2a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
             </table>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}