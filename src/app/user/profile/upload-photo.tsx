"use client";

import { useRef, useState } from "react";

export default function UploadPhoto({ profile }: { profile: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

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
      window.location.reload();
    } else {
      const data = await res.json();
      alert("❌ Upload failed: " + data.error);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove profile photo?")) return;

    setLoading(true);
    const res = await fetch("/api/profile/photo", {
      method: "DELETE",
    });

    setLoading(false);
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json();
      alert("❌ Remove failed: " + data.error);
    }
  };

  const isDefault = !profile?.photo_url;

  return (
    <div className="flex flex-col items-center mt-4 gap-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

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
  );
}
