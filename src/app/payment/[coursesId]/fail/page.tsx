"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/ui/footer";
import BackgroundImage from "@/components/ui/background-image";

export default function PaymentFailPage() {
  const params = useParams();
  const courseId = params?.coursesId;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 mt-15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex justify-center">
            <BackgroundImage
              src="/assets/bg-image.png"
              alt="background"
              className="absolute object-cover -z-10 hidden lg:block"
            />
            <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-[739px] text-center">
              <div className="w-16 h-16 bg-[#9B2FAC] rounded-full flex items-center justify-center mx-auto mb-4">
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
              <h3 className="text-h3 font-medium text-black mb-2">
                Payment failed
              </h3>
              <p className="text-b2 font-regular text-gray-700 mb-6 !leading-normal">
                {"Please check your payment details and try again"}
              </p>
              <Link
                href={`/payment/${courseId}`}
                className="block w-full max-w-[321px] bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 mx-auto"
              >
                Back to Payment
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
