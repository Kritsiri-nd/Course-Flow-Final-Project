"use client";

import { useRef } from "react";
import Image from "next/image";
import { Plus, AlertCircle } from "lucide-react";
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
  uploadedAttachedFileUrl?: string | null;
  isUploadingThumbnail: boolean;
  isUploadingVideo: boolean;
  isUploadingAttachment?: boolean;
  onFileUpload: (field: 'thumbnail' | 'video_url' | 'attachedFile', file: File) => void;
  onClearThumbnail: () => void;
  onClearVideo: () => void;
  onClearAttachment?: () => void;
}

export function FileUploadSection({
  formData,
  errors,
  previewThumbnailUrl,
  previewVideoUrl,
  uploadedThumbnailUrl,
  uploadedVideoUrl,
  uploadedAttachedFileUrl,
  isUploadingThumbnail,
  isUploadingVideo,
  isUploadingAttachment,
  onFileUpload,
  onClearThumbnail,
  onClearVideo,
  onClearAttachment
}: FileUploadSectionProps) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number): string => {
    if (!bytes && bytes !== 0) return "";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      const kb = bytes / 1024;
      return `${kb.toFixed(0)} kb`;
    }
    return `${mb.toFixed(1)} mb`;
  };

  const getAttachedFileName = (): string | null => {
    if (formData.attachedFile?.name) return formData.attachedFile.name;
    if (uploadedAttachedFileUrl) {
      try {
        const url = new URL(uploadedAttachedFileUrl);
        const last = url.pathname.split("/").pop() || null;
        return last;
      } catch {
        const parts = uploadedAttachedFileUrl.split("/");
        return parts[parts.length - 1] || null;
      }
    }
    return null;
  };

  const getFileExt = (): string => {
    const name = getAttachedFileName() || "";
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  };

  const FileTypeIcon = () => {
    const ext = getFileExt();
    const label = ext ? ext.toUpperCase() : "FILE";
    const bg = ext === "pdf" ? "#3B82F6" : ext === "txt" ? "#22C55E" : "#94A3B8";
    return (
      <div className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[10px] font-semibold" style={{ backgroundColor: bg }}>
        {label}
      </div>
    );
  };

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
              <Image
                src={(uploadedThumbnailUrl || previewThumbnailUrl) as string}
                alt="Thumbnail preview"
                width={300}
                height={200}
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
        {!(formData.attachedFile || uploadedAttachedFileUrl) && (
          <div 
            className="relative w-[160px] h-[160px] rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors border-2 border-dashed border-gray-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-b3 text-blue-400 font-medium">Upload File</span>
          </div>
        )}
        {isUploadingAttachment && (
          <p className="text-xs text-gray-500 mt-1">Uploading file...</p>
        )}
        {(formData.attachedFile || uploadedAttachedFileUrl) && (
          <div className="mt-2 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <FileTypeIcon />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  {uploadedAttachedFileUrl ? (
                    <a href={uploadedAttachedFileUrl} target="_blank" rel="noreferrer" className="block text-sm text-gray-800 truncate">
                      {getAttachedFileName() || "attachment"}
                    </a>
                  ) : (
                    <span className="block text-sm text-gray-800 truncate">{getAttachedFileName() || "attachment"}</span>
                  )}
                  {onClearAttachment && (
                    <button
                      type="button"
                      onClick={onClearAttachment}
                      className="text-slate-400 hover:text-red-600 text-[24px] leading-none whitespace-nowrap"
                      aria-label="Remove attachment"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {formData.attachedFile?.size != null && (
                    <span className="text-[11px] text-blue-600">{formatSize(formData.attachedFile.size)}</span>
                  )}
                  {!uploadedAttachedFileUrl && isUploadingAttachment && (
                    <span className="text-[11px] text-slate-400">Uploading…</span>
                  )}
                </div>
              </div>
            </div>
            {!uploadedAttachedFileUrl && isUploadingAttachment && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-violet-100 overflow-hidden">
                <div className="h-full w-1/2 bg-violet-400 animate-[progress_1.2s_ease_infinite]" style={{ width: "60%" }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
