// src/app/user/profile/profile-form.tsx
"use client";

import { useState } from "react";

export default function ProfileForm({ profile, email }: { profile: any; email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/profile", {
      method: "PUT",
      body: formData,
    });

    setIsSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      alert("❌ Error: " + data.error);
    } else {
      alert("✅ Profile updated!");
      window.location.reload();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label className="block mb-1">First Name</label>
        <input
          type="text"
          name="first_name"
          defaultValue={profile?.first_name || ""}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block mb-1">Last Name</label>
        <input
          type="text"
          name="last_name"
          defaultValue={profile?.last_name || ""}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block mb-1">Date of Birth</label>
        <input
          type="date"
          name="date_of_birth"
          defaultValue={profile?.date_of_birth || ""}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block mb-1">Educational Background</label>
        <input
          type="text"
          name="education"
          defaultValue={profile?.education || ""}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full border px-3 py-2 rounded-md bg-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-md"
      >
        {isSubmitting ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}
