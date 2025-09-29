// src/app/user/profile/upload-photo.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function UploadPhoto({ profile }: { profile: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>(
    profile?.photo_url || "/assets/defaultUser.png"
  );

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/profile/photo", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      // ✅ กัน cache + update state
      setPhotoUrl(`${data.url}?t=${Date.now()}`);
    } else {
      const data = await res.json();
      alert("❌ Upload failed: " + data.error);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    const res = await fetch("/api/profile/photo", { method: "DELETE" });
    setLoading(false);

    if (res.ok) {
      setPhotoUrl("/assets/defaultUser.png");
    } else {
      const data = await res.json();
      alert("❌ Remove failed: " + data.error);
    }
  };

  const isDefault = photoUrl.includes("defaultUser.png");

  return (
    <div className="flex flex-col items-center">
      {/* ✅ render รูปจาก state ตรงนี้เลย */}
      <div className="w-[200px] h-[200px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <Image
          key={photoUrl}
          src={photoUrl}
          alt="User photo"
          width={200}
          height={200}
          className="object-cover"
        />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="flex flex-col items-center mt-4 gap-2">
        {isDefault ? (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            {loading ? "Uploading..." : "Upload photo"}
          </button>
        ) : (
          <>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              {loading ? "Uploading..." : "Change photo"}
            </button>
            <button
              onClick={handleRemove}
              disabled={loading}
              className="text-blue-500 text-[16px] font-medium hover:underline"
            >
              {loading ? "Removing..." : "Remove photo"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
