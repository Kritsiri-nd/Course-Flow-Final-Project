"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import emailjs from "emailjs-com"; // 👈 เพิ่มตรงนี้
import {
  validateFirstName,
  validateLastName,
  validateDateOfBirth,
  validateEmail,
  validateEducationalBackground,
} from "@/lib/validators";

export default function ProfileForm({
  profile,
  email,
}: {
  profile: any;
  email: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    date_of_birth: profile?.date_of_birth || "",
    education: profile?.education || "",
    email: email || "",
  });

  const router = useRouter();

  // ✅ main handleSubmit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const { first_name, last_name, date_of_birth, education, email: newEmail } = formData;

    // 🧩 Validate ทั้งหมด
    const validationErrors: string[] = [];
    const validators = [
      validateFirstName(first_name),
      validateLastName(last_name),
      validateDateOfBirth(date_of_birth),
      validateEducationalBackground(education),
      validateEmail(newEmail),
    ];
    for (const v of validators) {
      if (!v.isValid) validationErrors.push(v.message!);
    }
    if (validationErrors.length > 0) {
      setError(validationErrors.join(" "));
      setIsSubmitting(false);
      return;
    }

    // ✅ Update profiles ปกติ (PUT)
    const form = new FormData();
    form.append("first_name", first_name);
    form.append("last_name", last_name);
    form.append("date_of_birth", date_of_birth);
    form.append("education", education);
    form.append("email", newEmail);

    const res = await fetch("/api/profile", { method: "PUT", body: form });
    if (!res.ok) {
      const data = await res.json();
      setError("❌ Error updating profile: " + data.error);
      setIsSubmitting(false);
      return;
    }

    // ✅ ถ้ามีการเปลี่ยนอีเมล → ส่งอีเมลยืนยันด้วย EmailJS
    if (newEmail && newEmail !== email) {
      try {
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // หมดอายุใน 1 ชม.
        const confirm_link = `${process.env.NEXT_PUBLIC_BASE_URL}/user/profile/confirm-email-change?token=${token}`;
    
        // ✅ 1. บันทึก token ลง profiles ผ่าน API ใหม่
        const saveRes = await fetch("/api/user/save-email-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, new_email: newEmail, expires }),
        });
    
        if (!saveRes.ok) {
          const data = await saveRes.json();
          throw new Error(data.error || "Failed to save token");
        }
    
        // ✅ 2. ส่งอีเมลยืนยันด้วย EmailJS
        const result = await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          {
            user_name: first_name || "User",
            current_email: email,
            new_email: newEmail,
            confirm_link,
          },
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
    
        console.log("✅ EmailJS result:", result.text);
        setMessage("✅ Confirmation email sent to your current email!");
      } catch (err: unknown) {
        console.error("❌ Email send failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError("❌ Failed to send confirmation email: " + errorMessage);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    

    // ✅ ไม่มีการเปลี่ยนอีเมล
    setIsSubmitting(false);
    setMessage("✅ Profile updated successfully!");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8">
      <form onSubmit={handleSubmit} method="POST" noValidate>
        <label className="block mb-2 text-b2 text-black">First Name</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={(e) =>
            setFormData((p) => ({ ...p, first_name: e.target.value }))
          }
          className="border border-gray-400 p-2 w-full rounded-md mb-4 text-b2 text-black bg-white"
        />

        <label className="block mb-2 text-b2 text-black">Last Name</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={(e) =>
            setFormData((p) => ({ ...p, last_name: e.target.value }))
          }
          className="border border-gray-400 p-2 w-full rounded-md mb-4 text-b2 text-black bg-white"
        />

        <label className="block mb-2 text-b2 text-black">Date of Birth</label>
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={(e) =>
            setFormData((p) => ({ ...p, date_of_birth: e.target.value }))
          }
          className="border border-gray-400 p-2 w-full rounded-md mb-4 text-b2 text-black bg-white"
        />

        <label className="block mb-2 text-b2 text-black">Education</label>
        <input
          type="text"
          name="education"
          value={formData.education}
          onChange={(e) =>
            setFormData((p) => ({ ...p, education: e.target.value }))
          }
          className="border border-gray-400 p-2 w-full rounded-md mb-4 text-b2 text-black bg-white"
        />

        <label className="block mb-2 text-b2 text-black">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((p) => ({ ...p, email: e.target.value }))
          }
          className="border border-gray-400 p-2 w-full rounded-md mb-8 text-b2 text-black bg-white"
        />  

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:py-3 py-4 bg-blue-600 text-white text-[16px] font-bold rounded-md hover:bg-blue-700"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
