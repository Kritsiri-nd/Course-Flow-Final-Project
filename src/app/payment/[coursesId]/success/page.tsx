"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/ui/footer";

export default function PaymentSuccessPage() {
    const params = useParams();
    const courseId = params?.coursesId;

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 mt-15">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    <div className="flex justify-center">
                        {/* Success Card */}
                        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-[739px] text-center">
                            {/* Success Icon */}
                            <div className="w-16 h-16 bg-[#2FAC8E] rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            {/* Success Message */}
                            <h1 className="text-h3 font-medium text-black mb-4">Thank you for subscribing</h1>
                            <p className="text-b2 font-regular text-gray-700 mb-8">Your payment is complete. You can start learning the course now.</p>

                            {/* Action Buttons */}
                            <div className="w-full flex flex-row gap-4">
                                <Link
                                    href={`/non-user/courses/${courseId}`}
                                    className="block w-full text-[16px] font-bold border-2 border-orange-500 text-orange-500 py-3 px-4 rounded-md hover:bg-orange-50 transition-colors"
                                >
                                    View Course detail
                                </Link>
                                <Link
                                    href={`/user/my-courses`}
                                    className="block w-full text-[16px] font-bold bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    Start Learning
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}