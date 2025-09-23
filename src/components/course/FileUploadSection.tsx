"use client";

import { useRef } from "react";
import { Plus, Upload, AlertCircle } from "lucide-react";
import { FILE_CONSTRAINTS } from "@/lib/constants";

interface FileUploadSectionProps {
  formData: {
    thumbnail: File | null;
    video_url: File | null;
    attachedFile: File | null;
  };
  errors: Record<string, string>;
  previewThumbnailUrl: string | null;
  previewVideoUrl: string | null;
  uploadedThumbnailUrl: string | null;
  uploadedVideoUrl: string | null;
  isUploadingThumbnail: boolean;
  isUploadingVideo: boolean;
  onFileUpload: (field: 'thumbnail' | 'video_url' | 'attachedFile', file: File) => void;
  onClearThumbnail: () => void;
  onClearVideo: () => void;
}

export function FileUploadSection({
  formData,
  errors,
  previewThumbnailUrl,
  previewVideoUrl,
  uploadedThumbnailUrl,
  uploadedVideoUrl,
  isUploadingThumbnail,
  isUploadingVideo,
  onFileUpload,
  onClearThumbnail,
  onClearVideo
}: FileUploadSectionProps) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {/* Cover Image */}
      <div>
        <label className="block text-b3 font-medium text-gray-700 mb-2">
          Cover image <span className="text-red-500">*</span>
        </label>
        <p className="text-b3 text-gray-500 mb-3">
          Supported file types: {FILE_CONSTRAINTS.IMAGE.ALLOWED_EXTENSIONS.join(', ')}. Max file size: 5 MB
        </p>
        <input
          type="file"
          ref={thumbnailInputRef}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileUpload('thumbnail', file);
          }}
          className="hidden"
        />
        <div 
          className={`relative w-[240px] h-[240px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors border-2 border-dashed ${
            errors.thumbnail ? 'border-[#9B2FAC]' : 'border-gray-300'
          }`}
          onClick={() => thumbnailInputRef.current?.click()}
        >
          {previewThumbnailUrl || uploadedThumbnailUrl ? (
            <div className="w-full h-full flex items-center justify-center p-2">
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
              onClick={(e) => { e.stopPropagation(); onClearThumbnail(); }}
              className="absolute top-2 right-2 flex items-center justify-center text-gray-500 text-[20px] font-bold leading-none"
              aria-label="Remove image"
              title="Remove"
            >
              ×
            </button>
          )}
          {errors.thumbnail && !(previewThumbnailUrl || uploadedThumbnailUrl) && (
            <AlertCircle className="absolute top-2 right-2 h-4 w-4 text-[#9B2FAC]" />
          )}
        </div>
        {isUploadingThumbnail && (
          <p className="text-xs text-gray-500 mt-1">Uploading image...</p>
        )}
        {errors.thumbnail && (
          <p className="text-[#9B2FAC] text-sm mt-1">{errors.thumbnail}</p>
        )}
      </div>

      {/* Video Trailer */}
      <div className="mt-6">
        <label className="block text-b3 font-medium text-gray-700 mb-2">
          Video Trailer <span className="text-red-500">*</span>
        </label>
        <p className="text-b3 text-gray-500 mb-3">
          Supported file types: {FILE_CONSTRAINTS.VIDEO.ALLOWED_EXTENSIONS.join(', ')}. Max file size: 20 MB
        </p>
        <input
          type="file"
          ref={videoInputRef}
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileUpload('video_url', file);
          }}
          className="hidden"
        />
        <div 
          className={`relative w-[240px] h-[240px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors border-2 border-dashed ${
            errors.video_url ? 'border-[#9B2FAC]' : 'border-gray-300'
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
              onClick={(e) => { e.stopPropagation(); onClearVideo(); }}
              className="absolute top-2 right-2 flex items-center justify-center text-gray-500 text-[20px] font-bold leading-none"
              aria-label="Remove video"
              title="Remove"
            >
              ×
            </button>
          )}
          {errors.video_url && !(previewVideoUrl || uploadedVideoUrl) && (
            <AlertCircle className="absolute top-2 right-2 h-4 w-4 text-[#9B2FAC]" />
          )}
        </div>
        {isUploadingVideo && (
          <p className="text-xs text-gray-500 mt-1">Uploading video...</p>
        )}
        {errors.video_url && (
          <p className="text-[#9B2FAC] text-sm mt-1">{errors.video_url}</p>
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
            if (file) onFileUpload('attachedFile', file);
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
  );
}
