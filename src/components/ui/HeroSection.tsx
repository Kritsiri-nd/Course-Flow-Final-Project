"use client";

import { useRouter } from "next/navigation";

interface HeroSectionProps {
  isMobile?: boolean;
}

export default function HeroSection({ isMobile = false }: HeroSectionProps) {
  const router = useRouter();

  if (isMobile) {
    return (
      <div className="w-full h-[704px] bg-gradient-to-br from-[#E5ECF8] to-[#95BEFF] relative overflow-hidden">
        {/* Mobile wave - darker blue shape from bottom-right */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 375 704"
          className="absolute bottom-0 right-0"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M375 704C375 704 320 550 250 450C180 350 120 250 80 150C40 100 60 50 100 0C140 -20 200 0 250 20C300 40 350 60 375 80V704Z"
            fill="url(#paint0_linear_mobile)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_mobile"
              x1="200"
              y1="300"
              x2="375"
              y2="704"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0040E6" />
              <stop offset="1" stopColor="#1A1A1A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Mobile text - positioned top-left */}
        <div className="relative z-10 px-6 pt-20 flex flex-col items-start text-left">
          <h1 className="text-[32px] font-bold leading-[120%] text-[#1A1A1A] mb-4 max-w-[300px]">
            Best Virtual Classroom Software
          </h1>
          <p className="text-base font-normal leading-[150%] text-[#646D89] mb-8 max-w-[300px]">
            Welcome to Schooler! The one-stop online class management system
            that caters to all your educational needs!
          </p>
          <button
            onClick={() => router.push("/non-user/courses")}
            className="w-[180px] h-[52px] rounded-[12px] bg-[#2F5FAC] text-white font-semibold text-base cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
          >
            Explore Courses
          </button>
        </div>

        {/* Mobile vector image - positioned bottom-right */}
        <div
          className="absolute bottom-[120px] right-[30px] w-[180px] h-[180px] cursor-pointer hover:scale-105 transition-transform z-20"
          onClick={() => router.push("/non-user/courses")}
        >
          <img
            src="/images/vector.png"
            alt="Educational illustration"
            width={180}
            height={180}
            className="opacity-100"
          />
        </div>

        <MobileDecorativeElements />
      </div>
    );
  }

  return null; 
}

function MobileDecorativeElements() {
  return (
    <>
      {/* Yellow triangle - positioned at bottom center pointing down */}
      <svg
        width="23"
        height="23"
        viewBox="0 0 23 23"
        className="absolute bottom-[30px] left-1/2 transform -translate-x-1/2"
        fill="none"
        style={{ opacity: 1 }}
      >
        <path
          d="M11.5 1L21.5 20H1.5L11.5 1Z"
          stroke="#FBAA1C"
          strokeWidth="2"
        />
      </svg>

      {/* Light blue circle - positioned on the left side near text */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="absolute top-[180px] left-[40px]"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="#95BEFF"
          strokeWidth="2"
        />
      </svg>

      {/* Green plus - positioned above and to the right of illustration */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        className="absolute top-[220px] right-[100px]"
        fill="none"
      >
        <path
          d="M10 2V18M2 10H18"
          stroke="#2FAC61"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Additional small decorative circle near illustration */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className="absolute bottom-[180px] right-[80px]"
        fill="none"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="#2FAC8E"
          strokeWidth="1.5"
        />
      </svg>
    </>
  );
}
