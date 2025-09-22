"use client";

import { useRouter } from "next/navigation";
import ProtectIcon from "../../assets/protectIcon";
import HeartIcon from "../../assets/heartIcon";
import TestimonialCarousel from "./TestimonialCarousel";

export default function Instructure() {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        {/* Hero Section - Desktop + Mobile Responsive */}
        <div className="h-[600px] sm:h-[700px] w-[100vw] bg-[#E5ECF8] relative overflow-hidden">
          {/* Wave - Desktop Only */}
          <svg
            width="1032"
            height="700"
            viewBox="0 0 1032 700"
            className="absolute right-0 hidden sm:block"
            fill="none"
          >
            <path
              d="M0 858C0 858 10.0852 555.849 415.528 481.5C820.971 407.151 944.357 85.6782 1018.1 -51.9502C1091.84 -189.579 1160.82 -311.313 1419 -254.858V857.987H0V858Z"
              fill="url(#paint0_linear_11_769)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_11_769"
                x1="29.6008"
                y1="448"
                x2="1264.69"
                y2="999.963"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#95BEFF" />
                <stop offset="1" stopColor="#0040E6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Mobile Wave */}
          <img
            src="/images/wave.png"
            alt="Wave background"
            className="absolute opacity-100 sm:hidden"
            style={{
              width: '682px',
              height: '541px',
              top: '80px',          
              opacity: 1
            }}
          />

          {/* Vector image - Desktop */}
          <div
            className="absolute top-[151px] left-[1290px] w-[452px] h-[448px] cursor-pointer hover:scale-105 transition-transform hidden sm:block"
            onClick={() => router.push("/non-user/courses")}
          >
            <img
              src="/images/vector.png"
              alt="Educational illustration"
              width={452}
              height={448}
              className="opacity-100"
            />
          </div>

          {/* Mobile Vector Image*/}
          <div
            className="absolute opacity-100 cursor-pointer hover:scale-105 transition-transform z-20 sm:hidden"
            style={{
              top: '270px',
              left: '50px',
              width: '317px',
              height: '314px'
            }}
            onClick={() => router.push("/non-user/courses")}
          >
            <img
              src="/images/vector.png"
              alt="Educational illustration"
              width={310}
              height={307}
              className="opacity-100"
            />
          </div>

          {/* Decorative Elements - Desktop */}
          {/* orange triangle */}
          <svg
            width="51"
            height="52"
            viewBox="0 0 51 52"
            className="absolute right-[167.22px] bottom-[75.93px] hidden sm:block"
            fill="none"
          >
            <path
              d="M11.3509 20.0206L37.1574 16.0633L27.6617 40.5195L11.3509 20.0206Z"
              stroke="#FBAA1C"
              strokeWidth="3"
            />
          </svg>

          {/* green circle */}
          <svg
            width="15"
            height="16"
            viewBox="0 0 15 16"
            className="absolute bottom-[271.91px] right-[56px] hidden sm:block"
            fill="none"
          >
            <path
              d="M13.5 7.5431C13.5 10.8887 10.8056 13.5862 7.5 13.5862C4.19438 13.5862 1.5 10.8887 1.5 7.5431C1.5 4.19747 4.19438 1.5 7.5 1.5C10.8056 1.5 13.5 4.19747 13.5 7.5431Z"
              stroke="#2FAC8E"
              strokeWidth="3"
            />
          </svg>

          {/* blue circle */}
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            className="absolute right-[824.65px] bottom-[130.65px] hidden sm:block"
            fill="none"
          >
            <circle
              cx="13.1741"
              cy="13.1741"
              r="11.6741"
              stroke="url(#paint0_linear_15_82)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient
                id="paint0_linear_15_82"
                x1="0.549634"
                y1="16.7628"
                x2="24.9849"
                y2="25.4358"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#95BEFF" />
                <stop offset="1" stopColor="#0040E6" />
              </linearGradient>
            </defs>
          </svg>

          {/*left blue circle */}
          <svg
            width="69"
            height="104"
            viewBox="0 0 69 104"
            className="absolute top-[56px] block"
            fill="none"
          >
            <circle cx="17" cy="52" r="52" fill="#C6D6EF" />
          </svg>

          {/* green x */}
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            className="absolute right-[615.32px] bottom-[520.32px]"
            fill="none"
          >
            <path
              d="M13.843 1.99998L8.83754 20.6805"
              stroke="#2FAC61"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M1.99986 8.83751L20.6804 13.8429"
              stroke="#2FAC61"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          {/* Mobile Decorative Elements*/}
          {/* orange triangle */}
          <svg
            width="49"
            height="48"
            viewBox="0 0 51 52"
            className="absolute right-[190px] bottom-[0px] sm:hidden"
            fill="none"
          >
            <path
              d="M11.3509 20.0206L37.1574 16.0633L27.6617 40.5195L11.3509 20.0206Z"
              stroke="#FBAA1C"
              strokeWidth="3"
            />
          </svg>
            
          {/* blue circle */}
          <img
            src="/images/sm-blue circle.png"
            alt="Blue circle"
            className="absolute right-[350px] bottom-[145px] sm:hidden z-30"
            style={{
              width: '26.3482666015625px',
              height: '26.3482666015625px',
              opacity: 1,
              border: '3px solid transparent'
            }}
          />

          {/* green x */}
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            className="absolute right-[160px] bottom-[280px] sm:hidden"
            fill="none"
          >
            <path
              d="M13.843 1.99998L8.83754 20.6805"
              stroke="#2FAC61"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M1.99986 8.83751L20.6804 13.8429"
              stroke="#2FAC61"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          {/* green circle */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="absolute bottom-[190px] right-[70px] sm:hidden"
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

          {/* Text - Desktop */}
          <div className="absolute top-[165px] left-[160px] flex flex-col flex-start gap-[24px] w-[643px] hidden sm:flex">
            <p className="text-[66px] font-medium leading-[125%] tracking-[-2%] text-[#1A1A1A]">
              Best Virtual Classroom Software
            </p>
            <p className="text-xl font-normal leading-[150%] tracking-[0%] text-[#646D89]">
              Welcome to Schooler! The one-stop online class management system
              that caters to all your educational needs!
            </p>
            <div
              onClick={() => router.push("/non-user/courses")}
              className="w-[193px] h-[60px] rounded-[12px] bg-[#2F5FAC] text-white font-semibold text-base cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
            >
              Explore Courses
            </div>
          </div>

          {/* Mobile Text*/}
          <div className="relative z-10 px-10 pt-10 flex flex-col items-start text-left sm:hidden">
            <h1 className="text-[32px] font-bold leading-[120%] text-[#1A1A1A] mb-4 max-w-[300px]">
              Best Virtual Classroom Software
            </h1>
            <p className="text-base font-normal leading-[150%] text-[#646D89] mb-6 max-w-[400px]">
              Welcome to Schooler! <br />
              The one-stop online class management system <br />
              that caters to all your educational needs!
            </p>
            <button
              onClick={() => router.push("/non-user/courses")}
              className="w-[180px] h-[52px] rounded-[12px] bg-[#2F5FAC] text-white font-semibold text-base cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
            >
              Explore Courses
            </button>
          </div>
        </div>

        {/* Features Section - Responsive */}
        <div className="h-auto sm:h-[1111px] w-[90vw] sm:w-[80vw] relative flex justify-center items-center py-[40px] sm:py-0">
          {/* Background Elements - Desktop */}
          <svg
            width="1233"
            height="1111"
            viewBox="0 0 1233 1111"
            className="absolute hidden sm:block"
            fill="none"
          >
            <circle
              cx="44.7032"
              cy="13.7032"
              r="36.5"
              transform="rotate(-75 44.7032 13.7032)"
              fill="url(#paint0_linear_15_1851)"
            />
            <circle cx="384" cy="110" r="16" fill="#E5ECF8" />
            <circle cx="1135.5" cy="1106.5" r="42.5" fill="#C6DCFF" />
            <path
              d="M1223.84 399L1218.84 417.68"
              stroke="#9B2FAC"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M1212 405.837L1230.68 410.843"
              stroke="#9B2FAC"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id="paint0_linear_15_1851"
                x1="9.726"
                y1="23.6459"
                x2="77.4257"
                y2="47.6752"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#95BEFF" />
                <stop offset="1" stopColor="#0040E6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Content - Responsive */}
          <div className="flex flex-col gap-[40px] sm:gap-[120px] w-full">
            {/* First Feature Row - Responsive */}
            <div className="flex flex-col lg:flex-row gap-[30px] sm:gap-[119px]">
              <div className="w-full lg:w-[454px] h-[250px] sm:h-[330px] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 order-2 lg:order-1">
                <img
                  src="/images/learning.png"
                  alt="Learning experience"
                  width={454}
                  height={330}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-[20px] sm:gap-[40px] order-1 lg:order-2">
                <p className="text-[24px] sm:text-[36px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-[#2B2C4F]">
                  Learning experience has been <br className="hidden sm:block" />
                  enhanced with new technologies
                </p>
                <div className="flex flex-col gap-[20px] sm:gap-[24px] w-full">
                  <div className="flex gap-[16px] sm:gap-[24px]">
                    <div className="flex-shrink-0">
                      <ProtectIcon />
                    </div>
                    <div className="flex flex-col gap-[8px] sm:gap-[10px] flex-1">
                      <p className="text-[18px] sm:text-[24px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-[#000000]">
                        Secure & Easy
                      </p>
                      <p className="text-[14px] sm:text-[16px] font-normal leading-[140%] sm:leading-[150%] tracking-[0%] text-[#646D89]">
                        Duis aute irure dolor in reprehenderit in voluptate
                        velit es se cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-[16px] sm:gap-[24px]">
                    <div className="flex-shrink-0">
                      <HeartIcon />
                    </div>
                    <div className="flex flex-col gap-[8px] sm:gap-[10px] flex-1">
                      <p className="text-[18px] sm:text-[24px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-[#000000]">
                        Support All Student
                      </p>
                      <p className="text-[14px] sm:text-[16px] font-normal leading-[140%] sm:leading-[150%] tracking-[0%] text-[#646D89]">
                        Duis aute irure dolor in reprehenderit in voluptate
                        velit es se cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Feature Row - Responsive */}
            <div className="flex flex-col lg:flex-row gap-[30px] sm:gap-[119px]">
              <div className="flex flex-col gap-[20px] sm:gap-[30px] order-2 lg:order-1">
                <p className="text-[24px] sm:text-[36px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-[#2B2C4F]">
                  Interaction between the tutor <br className="hidden sm:block" />
                  and the learners
                </p>
                <div className="flex gap-[16px] sm:gap-[24px]">
                  <div className="flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px]">
                      <path
                        d="M23.9209 16.955C25.2971 16.75 26.3567 15.4985 26.3597 13.9823C26.3597 12.4881 25.3327 11.2492 23.986 11.0148"
                        stroke="#5483D0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M25.7363 20.4642C27.0692 20.6756 27.9995 21.1705 27.9995 22.1908C27.9995 22.8929 27.5615 23.3491 26.8531 23.6358"
                        stroke="#5483D0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18 20.8969C14.8292 20.8969 12.1211 21.4064 12.1211 23.4416C12.1211 25.4758 14.8124 26 18 26C21.1707 26 23.8778 25.4957 23.8778 23.4594C23.8778 21.4232 21.1875 20.8969 18 20.8969Z"
                        stroke="#5483D0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.0001 17.9922C20.0807 17.9922 21.7677 16.204 21.7677 13.9961C21.7677 11.7893 20.0807 10 18.0001 10C15.9195 10 14.2324 11.7893 14.2324 13.9961C14.2246 16.1956 15.8987 17.9849 17.9725 17.9922H18.0001Z"
                        stroke="#5483D0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.0794 16.955C10.7022 16.75 9.64358 15.4985 9.64062 13.9823C9.64062 12.4881 10.6676 11.2492 12.0143 11.0148"
                        stroke="#5483D0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.2632 20.4642C8.93032 20.6756 8 21.1705 8 22.1908C8 22.8929 8.43803 23.3491 9.14637 23.6358"
                        stroke="#5483D0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <rect
                        x="0.5"
                        y="0.5"
                        width="35"
                        height="35"
                        rx="17.5"
                        stroke="#5483D0"
                        strokeDasharray="2 2"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-[8px] sm:gap-[10px]">
                    <p className="text-[18px] sm:text-[24px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-[#000000]">
                      Purely Collaborative
                    </p>
                    <p className="text-[14px] sm:text-[16px] font-normal leading-[140%] sm:leading-[150%] tracking-[0%] text-[#646D89] w-full">
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      es se cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint.
                    </p>
                  </div>
                </div>
                <div className="flex gap-[16px] sm:gap-[24px]">
                  <div className="flex-shrink-0">
                    <HeartIcon />
                  </div>
                  <div className="flex flex-col gap-[8px] sm:gap-[10px]">
                    <p className="text-[18px] sm:text-[24px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-[#000000]">
                      Support All Student
                    </p>
                    <p className="text-[14px] sm:text-[16px] font-normal leading-[140%] sm:leading-[150%] tracking-[0%] text-[#646D89] w-full">
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      es se cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint.
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[454px] h-[250px] sm:h-[330px] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 order-1 lg:order-2">
                <img
                  src="/images/interaction.png"
                  alt="Learning experience"
                  width={454}
                  height={330}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instructors Section - Responsive */}
        <div className="h-auto sm:h-[823px] w-[90vw] sm:w-[80vw] relative flex justify-center items-center py-[40px] sm:py-0">
          <svg
            width="30"
            height="30"
            viewBox="0 0 51 51"
            fill="none"
            className="absolute left-[20px] sm:left-[70px] bottom-[20px] sm:bottom-[76.22px]"
          >
            <path
              d="M11.3581 19.9099L37.1499 15.9774L27.6597 40.28L11.3581 19.9099Z"
              stroke="#FBAA1C"
              strokeWidth="2"
            />
          </svg>
          
          <div className="flex flex-col gap-[30px] sm:gap-[60px] w-full">
            <p className="text-[24px] sm:text-[36px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-center text-[#000000]">
              Our Professional Instructor
            </p>
            
            <div className="flex flex-col sm:flex-row gap-[20px] sm:gap-[24px] justify-center items-center">
              <div className="flex flex-col gap-[16px] sm:gap-[24px] hover:scale-105 transition-transform w-full sm:w-[357px]">
                <div className="w-full h-[300px] sm:h-[420px] rounded-lg overflow-hidden cursor-pointer">
                  <img
                    src="/images/Jane Cooper.png"
                    alt="Jane Cooper"
                    width={357}
                    height={420}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-center flex flex-col gap-[8px] sm:gap-[10px]">
                  <p className="cursor-pointer text-[18px] sm:text-[24px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-center text-[#000000]">
                    Jane Cooper
                  </p>
                  <p className="cursor-pointer text-[14px] sm:text-[16px] font-normal leading-[140%] sm:leading-[150%] tracking-[0%] text-center text-[#5483D0]">
                    UX/UI Designer
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-[16px] sm:gap-[24px] hover:scale-105 transition-transform w-full sm:w-[357px]">
                <div className="cursor-pointer w-full h-[300px] sm:h-[420px] rounded-lg overflow-hidden">
                  <img
                    src="/images/Esther Howard.png"
                    alt="Esther Howard"
                    width={357}
                    height={420}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-center flex flex-col gap-[8px] sm:gap-[10px]">
                  <p className="cursor-pointer text-[18px] sm:text-[24px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-center text-[#000000]">
                    Esther Howard
                  </p>
                  <p className="cursor-pointer text-[14px] sm:text-[16px] font-normal leading-[140%] sm:leading-[150%] tracking-[0%] text-center text-[#5483D0]">
                    Program Manager
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-[16px] sm:gap-[24px] hover:scale-105 transition-transform w-full sm:w-[357px]">
                <div className="cursor-pointer w-full h-[300px] sm:h-[420px] rounded-lg overflow-hidden">
                  <img
                    src="/images/Brooklyn Simmons.png"
                    alt="Brooklyn Simmons"
                    width={357}
                    height={420}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-center flex flex-col gap-[8px] sm:gap-[10px]">
                  <p className="cursor-pointer text-[18px] sm:text-[24px] font-medium leading-[120%] sm:leading-[125%] tracking-[-2%] text-center text-[#000000]">
                    Brooklyn Simmons
                  </p>
                  <p className="cursor-pointer text-[14px] sm:text-[16px] font-normal leading-[140%] sm:leading-[150%] tracking-[0%] text-center text-[#5483D0]">
                    Software Engineer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section - Responsive */}
        <div className="min-h-[400px] lg:h-[742px] w-full relative py-[40px] sm:py-8 lg:py-0">
          {/* Background SVG - Hidden on mobile */}
          <svg
            width="1356"
            height="630"
            viewBox="0 0 1356 630"
            className="absolute right-[0px] hidden lg:block"
            fill="none"
          >
            <circle cx="1260.17" cy="96.1741" r="13.1741" fill="#C6DCFF" />
            <path
              d="M13.843 609L8.83754 627.68"
              stroke="#2FAC61"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M2.00035 615.837L20.6809 620.843"
              stroke="#2FAC61"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle
              cx="1345.7"
              cy="44.7033"
              r="36.5"
              transform="rotate(-75 1345.7 44.7033)"
              fill="url(#paint0_linear_36_4312)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_36_4312"
                x1="1310.73"
                y1="54.6461"
                x2="1378.43"
                y2="78.6754"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#95BEFF" />
                <stop offset="1" stopColor="#0040E6" />
              </linearGradient>
            </defs>
          </svg>

          <div className="h-auto lg:h-[742px] w-[100vw] flex flex-col gap-[20px] sm:gap-[30px] lg:gap-[25px] px-4 sm:px-6 lg:px-8 mt-[20px] sm:mt-20">
            <p className="text-[20px] sm:text-[24px] lg:text-3xl font-semibold text-center text-gray-900">
              Our Graduates
            </p>
            <TestimonialCarousel />
          </div>
        </div>
      </div>
    </>
  );
}
