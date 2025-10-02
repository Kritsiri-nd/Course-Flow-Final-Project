"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
    const params = useParams();
    const courseId = params?.coursesId;

    return (
        <div className="min-h-screen bg-white">
            {/* Main Content */}
            <div className="ml-64 flex items-center justify-center min-h-screen relative">
                {/* Decorative Elements */}
                <div className="absolute top-20 left-20 w-4 h-4 border-2 border-blue-300 rounded-full"></div>
                <div className="absolute top-32 left-32 w-3 h-3 bg-blue-400 rounded-full"></div>
                <div className="absolute top-40 left-16 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">+</span>
                </div>
                <div className="absolute top-60 right-32 w-4 h-4 border-2 border-yellow-400 transform rotate-45"></div>
                <div className="absolute top-80 right-20 w-8 h-8 bg-blue-200 rounded-full"></div>

                {/* Success Card */}
                <div className="bg-white border-2 border-blue-500 rounded-lg p-12 max-w-md w-full text-center relative z-10">
                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank you for subscribing</h1>
                    <p className="text-gray-600 mb-8">Your payment is complete. You can start learning the course now.</p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <Link
                            href={`/non-user/courses/${courseId}`}
                            className="block w-full border-2 border-orange-500 text-orange-500 py-3 px-4 rounded-md hover:bg-orange-50 transition-colors"
                        >
                            View Course detail
                        </Link>
                        <Link
                            href={`/user/my-courses`}
                            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Start Learning
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-blue-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold">CourseFlow</div>
                        <div className="flex space-x-6">
                            <a href="/non-user/courses" className="hover:text-blue-200">All Courses</a>
                            <a href="#" className="hover:text-blue-200">Bundle Package</a>
                        </div>
                        <div className="flex space-x-4">
                            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                                <span className="text-xs">f</span>
                            </div>
                            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                                <span className="text-xs">ig</span>
                            </div>
                            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                                <span className="text-xs">tw</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}