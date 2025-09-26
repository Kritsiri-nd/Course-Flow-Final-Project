"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // 👈 client-side supabase
import { validateFirstName, validateLastName, validateDateOfBirth, validateEmail, validateEducationalBackground } from "@/lib/validators";

export default function ProfileForm({ profile, email }: { profile: any; email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Get form values
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const education = formData.get("education") as string;
    const emailValue = formData.get("email") as string;

    // Client-side validation
    const validationErrors: string[] = [];

    // First name validation
    const firstNameValidation = validateFirstName(firstName);
    if (!firstNameValidation.isValid) {
      validationErrors.push(firstNameValidation.message!);
    }

    // Last name validation
    const lastNameValidation = validateLastName(lastName);
    if (!lastNameValidation.isValid) {
      validationErrors.push(lastNameValidation.message!);
    }

    // Date of birth validation
    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.isValid) {
      validationErrors.push(dobValidation.message!);
    }

    // Email validation
    const emailValidation = validateEmail(emailValue);
    if (!emailValidation.isValid) {
      validationErrors.push(emailValidation.message!);
    }

    // Education validation
    const educationValidation = validateEducationalBackground(education);
    if (!educationValidation.isValid) {
      validationErrors.push(educationValidation.message!);
    }

    // If there are validation errors, show them and stop
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      setIsSubmitting(false);
      return;
    }

    // ✅ ยิงไป API /api/profile เพื่ออัปเดต profiles + รูป
    const res = await fetch("/api/profile", {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError("❌ Error: " + data.error);
      setIsSubmitting(false);
      return;
    }

    // ✅ เช็คว่ามีการแก้ไข email หรือเปล่า
    const newEmail = formData.get("email") as string;
    if (newEmail && newEmail !== email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });

      if (emailError) {
        setError("❌ Error updating email: " + emailError.message);
        setIsSubmitting(false);
        return;
      }

      // ✅ refresh session เพื่อให้ session.user.email อัปเดตทันที
      await supabase.auth.refreshSession();
    }

    setIsSubmitting(false);
    setMessage("✅ Profile updated!");
    router.refresh(); // refresh หน้า profile เพื่อโหลด session + profile ใหม่
  };

  return (
    <form
      onSubmit={handleSubmit}
      method="POST"
      noValidate
      className="space-y-4 w-full max-w-md"
    >
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
          name="email"
          defaultValue={email}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      {message && <p className="text-green-500 text-sm">{message}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-60"
      >
        {isSubmitting ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}
