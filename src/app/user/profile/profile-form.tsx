"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // 👈 client-side supabase
import { validateFirstName, validateLastName, validateDateOfBirth, validateEmail, validateEducationalBackground } from "@/lib/validators";

export default function ProfileForm({ profile, email }: { profile: any; email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  
  // Form state for controlled inputs
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    date_of_birth: profile?.date_of_birth || '',
    education: profile?.education || '',
    email: email || '',
  });
  
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

    // Get form values from state
    const firstName = formData.first_name;
    const lastName = formData.last_name;
    const dateOfBirth = formData.date_of_birth;
    const education = formData.education;
    const emailValue = formData.email;

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

    // ✅ สร้าง FormData สำหรับ API
    const apiFormData = new FormData();
    apiFormData.append("first_name", firstName);
    apiFormData.append("last_name", lastName);
    apiFormData.append("date_of_birth", dateOfBirth);
    apiFormData.append("education", education);
    apiFormData.append("email", emailValue);

    // ✅ ยิงไป API /api/profile เพื่ออัปเดต profiles + รูป
    const res = await fetch("/api/profile", {
      method: "PUT",
      body: apiFormData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError("❌ Error: " + data.error);
      setIsSubmitting(false);
      return;
    }

    // ✅ เช็คว่ามีการแก้ไข email หรือเปล่า
    if (emailValue && emailValue !== email) {
      try {
        const { error: emailError } = await supabase.auth.updateUser({ email: emailValue });

        if (emailError) {
          // ถ้าเป็น rate limit error ให้ข้ามไปไม่แสดง error
          if (emailError.message.includes('seconds')) {
            // ไม่แสดง error message สำหรับ rate limit
            console.log('Email update rate limited, skipping...');
          } else {
            setError("❌ Error updating email: " + emailError.message);
            setIsSubmitting(false);
            return;
          }
        } else {
          // ✅ อัปเดต form state เมื่อ email เปลี่ยนสำเร็จ
          setFormData(prev => ({ ...prev, email: emailValue }));
          
          // ✅ refresh session เพื่อให้ session.user.email อัปเดตทันที
          await supabase.auth.refreshSession();
        }
      } catch (error) {
        // ไม่แสดง error สำหรับ email update
        console.log('Email update failed, continuing...');
      }
    }

    setIsSubmitting(false);
    setMessage("✅ Profile updated!");
    
    // ถ้าไม่มี email update ให้ refresh ปกติ
    if (!(emailValue && emailValue !== email)) {
      router.refresh(); // refresh หน้า profile เพื่อโหลด session + profile ใหม่
    }
  };

  // Error Message Component
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    
    return (
      <div className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-[#9B2FAC33] ">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#9B2FAC]">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <span className="text-[#9B2FAC] text-sm">{error}</span>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          placeholder="Enter your First Name"
          className={`w-full border px-3 py-2 rounded-md focus:border-orange-500 focus:ring-orange-500 ${
            fieldErrors.first_name ? 'border-[#9B2FAC]' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('first_name', e.target.value)}
        />
        <ErrorMessage error={fieldErrors.first_name} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
          placeholder="Enter your Last Name"
          className={`w-full border px-3 py-2 rounded-md focus:border-orange-500 focus:ring-orange-500 ${
            fieldErrors.last_name ? 'border-[#9B2FAC]' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('last_name', e.target.value)}
        />
        <ErrorMessage error={fieldErrors.last_name} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
          className={`w-full border px-3 py-2 rounded-md focus:border-orange-500 focus:ring-orange-500 ${
            fieldErrors.date_of_birth ? 'border-[#9B2FAC]' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('date_of_birth', e.target.value)}
        />
        <ErrorMessage error={fieldErrors.date_of_birth} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Educational Background</label>
        <input
          type="text"
          name="education"
          value={formData.education}
          onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
          placeholder="Enter Education Background"
          className={`w-full border px-3 py-2 rounded-md focus:border-orange-500 focus:ring-orange-500 ${
            fieldErrors.education ? 'border-[#9B2FAC]' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('education', e.target.value)}
        />
        <ErrorMessage error={fieldErrors.education} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter Email"
          className={`w-full border px-3 py-2 rounded-md focus:border-orange-500 focus:ring-orange-500 ${
            fieldErrors.email ? 'border-[#9B2FAC]' : 'border-gray-300'
          }`}
          onBlur={(e) => validateField('email', e.target.value)}
        />
        <ErrorMessage error={fieldErrors.email} />
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
