// src/app/user/profile/upload-photo.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function UploadPhoto({ profile }: { profile: unknown }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  interface ProfileData {
    photo_url?: string;
  }

  const [photoUrl, setPhotoUrl] = useState<string>(
    (profile as ProfileData)?.photo_url || "/assets/defaultUser.png"
  );

  // ✅ ฟังก์ชันตรวจสอบไฟล์
  const validateFile = (file: File): string | null => {
    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return "File type must be .jpg, .png, or .jpeg";
    }

    // ตรวจสอบขนาดไฟล์ (5 MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size must be less than 5 MB";
    }

    return null;
  };

  const handleUpload = () => {
    setError(""); // ล้าง error เมื่อเริ่มอัพโหลดใหม่
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ ตรวจสอบไฟล์ก่อนอัพโหลด
    const validationError = validateFile(file);
    if (validationError) {
      setError(`Upload failed. ${validationError}`);
      return;
    }

    setLoading(true);
    setError(""); // ล้าง error เมื่อเริ่มอัพโหลด

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // ✅ กัน cache + update state
        setPhotoUrl(`${data.url}?t=${Date.now()}`);
        setError(""); // ล้าง error เมื่อสำเร็จ
      } else {
        const data = await res.json();
        setError(
          "Upload failed. Ensure the file is .jpg, .png, or .jpeg and less than 5 MB."
        );
      }
    } catch (err) {
      setError(
        "Upload failed. Ensure the file is .jpg, .png, or .jpeg and less than 5 MB."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(""); // ล้าง error เมื่อเริ่มลบ

    try {
      const res = await fetch("/api/profile/photo", { method: "DELETE" });

      if (res.ok) {
        setPhotoUrl("/assets/defaultUser.png");
        setError(""); // ล้าง error เมื่อสำเร็จ
      } else {
        const data = await res.json();
        setError("Remove failed: " + data.error);
      }
    } catch (err) {
      setError("Remove failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDefault = photoUrl.includes("defaultUser.png");

  return (
    <div className="flex flex-col items-center">
      {/* ✅ render รูปจาก state ตรงนี้เลย */}
      <div className="w-[358px] h-[358px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <Image
          key={photoUrl}
          src={photoUrl}
          alt="User photo"
          width={358}
          height={358}
          className="object-cover"
        />
      </div>

      {/* ✅ แสดงข้อความ error ใต้ภาพ */}
      {error && (
        <div className="mt-4 px-4 py-2 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
      />

      <div className="flex flex-col items-center mt-8 gap-2">
        {isDefault ? (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn-blue-500 hover:btn-blue-600 text-[18px] font-bold text-white sm:px-6 px-8 sm:py-2 py-4 rounded-md"
          >
            {loading ? "Uploading..." : "Upload photo"}
          </button>
        ) : (
          <>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="btn-blue-500 hover:btn-blue-600 text-[18px] font-bold text-white sm:px-6 px-8 sm:py-2 py-4 rounded-md"
            >
              {loading ? "Uploading..." : "Change photo"}
            </button>
            <button
              onClick={handleRemove}
              disabled={loading}
              className="text-blue-500 text-[18px] font-bold hover:underline"
            >
              {loading ? "Removing..." : "Remove photo"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
