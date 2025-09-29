"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // 👈 client-side supabase
import { validateFirstName, validateLastName, validateDateOfBirth, validateEmail, validateEducationalBackground } from "@/lib/validators";

export default function ProfileForm({ profile, email }: { profile: any; email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  
  // Real-time validation states
  const [fieldErrors, setFieldErrors] = useState<{
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    education?: string;
    email?: string;
  }>({});
  
  const router = useRouter();
  const supabase = createClient();

  // Real-time validation function
  const validateField = (fieldName: string, value: string) => {
    let validation: { isValid: boolean; message?: string } = { isValid: true };
    
    switch (fieldName) {
      case 'first_name':
        validation = validateFirstName(value);
        break;
      case 'last_name':
        validation = validateLastName(value);
        break;
      case 'date_of_birth':
        validation = validateDateOfBirth(value);
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'education':
        validation = validateEducationalBackground(value);
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? undefined : validation.message
    }));
  };

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

  // Validation Tooltip Component
  const ValidationTooltip = ({ error, fieldName }: { error?: string; fieldName: string }) => {
    if (!error) return null;
    
    return (
      <div className="absolute right-0 top-0 transform translate-x-full -translate-y-1 z-10">
        <div className="bg-gray-100 border border-gray-300 rounded-lg px-2 py-1 shadow-lg">
          <div className="flex items-center gap-1">
            <span className="text-orange-500 text-base font-bold">!</span>
            <span className="text-xs text-gray-700">โปรดกรอกฟิลด์นี้</span>
          </div>
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-1.5 h-1.5 bg-gray-100 border-l border-b border-gray-300 rotate-45"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8">
      <form
        onSubmit={handleSubmit}
        method="POST"
        noValidate
        className="mt-8 space-y-6"
      >
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
        <input
          type="text"
          name="first_name"
          defaultValue={profile?.first_name || ""}
          placeholder="Enter your First Name"
          className={`w-full border px-3 py-2 rounded-md focus:border-blue-500 focus:ring-blue-500 ${
            fieldErrors.first_name ? 'border-red-500' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('first_name', e.target.value)}
        />
        <ValidationTooltip error={fieldErrors.first_name} fieldName="first_name" />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input
          type="text"
          name="last_name"
          defaultValue={profile?.last_name || ""}
          placeholder="Enter your Last Name"
          className={`w-full border px-3 py-2 rounded-md focus:border-blue-500 focus:ring-blue-500 ${
            fieldErrors.last_name ? 'border-red-500' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('last_name', e.target.value)}
        />
        <ValidationTooltip error={fieldErrors.last_name} fieldName="last_name" />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input
          type="date"
          name="date_of_birth"
          defaultValue={profile?.date_of_birth || ""}
          className={`w-full border px-3 py-2 rounded-md focus:border-blue-500 focus:ring-blue-500 ${
            fieldErrors.date_of_birth ? 'border-red-500' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('date_of_birth', e.target.value)}
        />
        <ValidationTooltip error={fieldErrors.date_of_birth} fieldName="date_of_birth" />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Educational Background</label>
        <input
          type="text"
          name="education"
          defaultValue={profile?.education || ""}
          placeholder="Enter Education Background"
          className={`w-full border px-3 py-2 rounded-md focus:border-blue-500 focus:ring-blue-500 ${
            fieldErrors.education ? 'border-red-500' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('education', e.target.value)}
        />
        <ValidationTooltip error={fieldErrors.education} fieldName="education" />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          defaultValue={email}
          placeholder="Enter Email"
          className={`w-full border px-3 py-2 rounded-md focus:border-blue-500 focus:ring-blue-500 ${
            fieldErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('email', e.target.value)}
        />
        <ValidationTooltip error={fieldErrors.email} fieldName="email" />
      </div>

      {message && <p className="text-green-500 text-sm">{message}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 py-3.5 font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
