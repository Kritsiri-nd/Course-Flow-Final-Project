"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/ui/footer";

export default function ConfirmEmailChangePage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirm = async () => {
      if (!token) return;
      const res = await fetch("/api/user/confirm-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Your email has been successfully updated!");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    };

    confirm();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 mt-15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex justify-center">
            {/* Card */}
            <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-[739px] text-center">
              {/* Icon */}
              {status === "loading" && (
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3"
                    />
                  </svg>
                </div>
              )}

              {status === "success" && (
                <div className="w-16 h-16 bg-[#2FAC8E] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {status === "error" && (
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}

              {/* Title */}
              <h1 className="text-h3 font-medium text-black mb-4">
                {status === "loading"
                  ? "Processing..."
                  : status === "success"
                  ? "Email Change Successful"
                  : "Email Change Failed"}
              </h1>

              {/* Message */}
              <p className="text-b2 font-regular text-gray-700 mb-8">
                {status === "loading"
                  ? "Please wait while we verify your email change request."
                  : message}
              </p>

              {/* Buttons */}
              {status !== "loading" && (
                <div className="w-full flex flex-row gap-4 justify-center">
                  {status === "success" ? (
                    <>
                      <Link
                        href="/user/profile"
                        className="block w-full max-w-[200px] text-[16px] font-bold bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Back to Profile
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/user/profile"
                      className="block w-full max-w-[200px] text-[16px] font-bold border-2 border-red-500 text-red-500 py-3 px-4 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Try Again
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
