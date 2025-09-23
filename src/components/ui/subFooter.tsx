'use client';

import Image from 'next/image';
import Link from 'next/link';

function SubFooter() {
  const footerStyle = {
    background: 'linear-gradient(271deg, #5697ff 7.78%, #2558dd 73.86%)',
  };

  return (
    <>
      {/* Mobile Version - Completely Separate */}
      <div className="block md:hidden">
        <div className="flex justify-center h-auto relative" style={footerStyle}>
          <footer className="w-[90vw] flex flex-col justify-between relative py-12">
            {/* Top Section - Text and Button */}
            <div className="w-full flex flex-col justify-center items-center mb-8">
              <p className="text-[24px] font-bold text-white text-center mb-6">
                Want to start learning?
              </p>
              <Link href="/auth/register" className="inline-block">
                <button
                  className="cursor-pointer bg-white text-[#F47E20] border border-[#F47E20] rounded-[12px] font-semibold hover:scale-105 transition-transform duration-200 px-[32px] py-[18px] w-[169px] h-[60px]"
                >
                  Register here
                </button>
              </Link>
            </div>

            {/* Bottom Section - Image with decorative elements */}
            <div className="w-full relative flex justify-center">
              <Link href="/non-user/courses">
                <Image
                  src="/images/subfooter.png"
                  alt="Learning"
                  width={576}
                  height={390}
                  className="cursor-pointer max-w-full h-auto object-contain hover:scale-105 transition-transform duration-300 w-[280px]"
                />
              </Link>

              {/* Triangle - Upper right quadrant */}
              <svg
                width="23"
                height="23"
                viewBox="0 0 37 37"
                fill="none"
                className="absolute top-0 right-[80px]"
                style={{
                  transform: 'rotate(115deg)',
                  opacity: 1
                }}
              >
                <path
                  d="M34.9135 34.9134L2.46871 26.2199L26.22 2.4686L34.9135 34.9134Z"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>



              {/* Green Circle - Bottom left corner */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 27 27"
                fill="none"
                className="absolute bottom-[-30px] left-[20px]"
              >
                <circle
                  cx="13.1741"
                  cy="13.1741"
                  r="11.6741"
                  stroke="#2FAC8E"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </footer>
        </div>
      </div>

      {/* Desktop Version - Original Code */}
      <div className="hidden md:flex justify-center h-[500px] relative" style={footerStyle}>
        <footer className="w-[80vw] flex justify-between relative">
          {/* Left Section */}
          <div className="w-[40vw] flex flex-col justify-evenly items-start">
            <p className="text-[32px] font-bold text-white w-[70%]">
              Want to start learning?
            </p>
            <Link href="/auth/register" className="inline-block translate-y-[-68px]">
              <button
                className="cursor-pointer bg-white text-[#F47E20] border border-[#F47E20] rounded-[12px] font-semibold hover:scale-105 transition-transform duration-200 px-[32px] py-[18px] w-[169px] h-[60px] gap-[10px]"
              >
                Register here
              </button>
            </Link>
          </div>

          {/* Decorative SVG */}
          <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            className="absolute top-[403px] left-[406px]"
          >
            <circle
              cx="13.1741"
              cy="13.1741"
              r="11.6741"
              stroke="#2FAC8E"
              strokeWidth="3"
            />
          </svg>

          {/* Right Section */}
          <div className="w-[40vw] self-end relative">
            <Link href="/non-user/courses">
              <Image
                src="/images/subfooter.png"
                alt="Learning"
                width={576}
                height={390}
                className="cursor-pointer max-w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <svg
              width="37"
              height="37"
              viewBox="0 0 37 37"
              fill="none"
              className="absolute top-[128px] right-[-55px]"
            >
              <path
                d="M34.9135 34.9134L2.46871 26.2199L26.22 2.4686L34.9135 34.9134Z"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
        </footer>
      </div>
    </>
  );
}

export default SubFooter;