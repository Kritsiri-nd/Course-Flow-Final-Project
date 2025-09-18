'use client'

import { useRouter } from "next/navigation"

interface ProtectIconProps {
  width?: string;
  height?: string;
}

function ProtectIcon(props: ProtectIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      viewBox="0 0 24 24"
      fill="none">
      <path
        d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
        stroke="#5483D0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface HeartIconProps {
  width?: string;
  height?: string;
}

function HeartIcon(props: HeartIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      viewBox="0 0 24 24"
      fill="none">
      <path
        d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6727 2.99817 16.95 2.99817C16.2273 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.2227 22.4518 8.5C22.4518 7.7773 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61Z"
        stroke="#5483D0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Instructure() {
  const router = useRouter()
  
  return (
    <>
      <div className='flex flex-col items-center justify-center'>
        <div className='h-[700px] w-[100vw] bg-blue-50 relative'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='1032'
            height='700'
            viewBox='0 0 1032 700'
            className='absolute right-0'
            fill='none'>
            <path
              d='M0 858C0 858 10.0852 555.849 415.528 481.5C820.971 407.151 944.357 85.6782 1018.1 -51.9502C1091.84 -189.579 1160.82 -311.313 1419 -254.858V857.987H0V858Z'
              fill='url(#paint0_linear_11_769)'
            />
            <defs>
              <linearGradient
                id='paint0_linear_11_769'
                x1='29.6008'
                y1='448'
                x2='1264.69'
                y2='999.963'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#95BEFF' />
                <stop offset='1' stopColor='#0040E6' />
              </linearGradient>
            </defs>
          </svg>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='51'
            height='52'
            viewBox='0 0 51 52'
            className='absolute right-[167.22px] bottom-[75.93px]'
            fill='none'>
            <path
              d='M11.3509 20.0206L37.1574 16.0633L27.6617 40.5195L11.3509 20.0206Z'
              stroke='#FBAA1C'
              strokeWidth='3'
            />
          </svg>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='15'
            height='16'
            viewBox='0 0 15 16'
            className='absolute bottom-[271.91px] right-[56px]'
            fill='none'>
            <path
              d='M13.5 7.5431C13.5 10.8887 10.8056 13.5862 7.5 13.5862C4.19438 13.5862 1.5 10.8887 1.5 7.5431C1.5 4.19747 4.19438 1.5 7.5 1.5C10.8056 1.5 13.5 4.19747 13.5 7.5431Z'
              stroke='#2FAC8E'
              strokeWidth='3'
            />
          </svg>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='27'
            height='27'
            viewBox='0 0 27 27'
            className='absolute right-[824.65px] bottom-[130.65px]'
            fill='none'>
            <circle
              cx='13.1741'
              cy='13.1741'
              r='11.6741'
              stroke='url(#paint0_linear_15_82)'
              strokeWidth='3'
            />
            <defs>
              <linearGradient
                id='paint0_linear_15_82'
                x1='0.549634'
                y1='16.7628'
                x2='24.9849'
                y2='25.4358'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#95BEFF' />
                <stop offset='1' stopColor='#0040E6' />
              </linearGradient>
            </defs>
          </svg>
          <div className='absolute top-[165px] left-[160px] flex flex-col flex-start gap-[24px] w-[643px]'>
            <h1 className='text-4xl font-bold text-gray-900'>Best Virtual Classroom Software</h1>
            <p className='text-lg text-gray-700'>
              Welcome to Schooler! The one-stop online class management system
              that caters to all your educational needs!
            </p>
            <button
              className='bg-blue-600 text-white text-base font-bold px-6 py-3 rounded-md hover:bg-blue-700 transition-colors w-[193px]'
              onClick={() => router.push("/public/courses")}>
              Explore Courses
            </button>
          </div>
        </div>
        <div className='h-[1111px] w-[80vw] relative flex justify-center items-center'>
          <svg
            width='1233'
            height='1111'
            viewBox='0 0 1233 1111'
            className='absolute'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <circle
              cx='44.7032'
              cy='13.7032'
              r='36.5'
              transform='rotate(-75 44.7032 13.7032)'
              fill='url(#paint0_linear_15_1851)'
            />
            <circle cx='384' cy='110' r='16' fill='#E5ECF8' />
            <circle cx='1135.5' cy='1106.5' r='42.5' fill='#C6DCFF' />
            <path
              d='M1223.84 399L1218.84 417.68'
              stroke='#9B2FAC'
              strokeWidth='3'
              strokeLinecap='round'
            />
            <path
              d='M1212 405.837L1230.68 410.843'
              stroke='#9B2FAC'
              strokeWidth='3'
              strokeLinecap='round'
            />
            <defs>
              <linearGradient
                id='paint0_linear_15_1851'
                x1='9.726'
                y1='23.6459'
                x2='77.4257'
                y2='47.6752'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#95BEFF' />
                <stop offset='1' stopColor='#0040E6' />
              </linearGradient>
            </defs>
          </svg>
          <div className='inline-flex flex-col gap-[120px]'>
            <div className='flex flex-start gap-[119px]'>
              <div className='w-[454px] h-[330px] bg-gray-200 rounded-lg flex items-center justify-center'>
                <span className='text-gray-500'>Image Placeholder</span>
              </div>
              <div className='flex flex-col gap-[40px]'>
                <h1 className='text-3xl font-bold text-gray-900'>
                  Learning experience has been <br />
                  enhanced with new technologies
                </h1>
                <div className='flex flex-col gap-[24px] w-[547px]'>
                  <div className='flex gap-[24px]'>
                    <ProtectIcon />
                    <div className='flex flex-col gap-[10px] flex-1'>
                      <h1 className='text-xl font-semibold text-gray-900'>Secure & Easy</h1>
                      <p className='text-gray-700'>
                        Duis aute irure dolor in reprehenderit in voluptate
                        velit es se cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint.
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-[24px]'>
                    <HeartIcon />
                    <div className='flex flex-col gap-[10px] flex-1'>
                      <h1 className='text-xl font-semibold text-gray-900'>Support All Student</h1>
                      <p className='text-gray-700'>
                        Duis aute irure dolor in reprehenderit in voluptate
                        velit es se cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-start gap-[119px]'>
              <div className='flex flex-col gap-[40px]'>
                <h1 className='text-3xl font-bold text-gray-900'>
                  Interaction between the tutor <br />
                  and the learners
                </h1>
                <div className='flex gap-[24px]'>
                  <svg
                    width='36'
                    height='36'
                    viewBox='0 0 36 36'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M23.9209 16.955C25.2971 16.75 26.3567 15.4985 26.3597 13.9823C26.3597 12.4881 25.3327 11.2492 23.986 11.0148'
                      stroke='#5483D0'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M25.7363 20.4642C27.0692 20.6756 27.9995 21.1705 27.9995 22.1908C27.9995 22.8929 27.5615 23.3491 26.8531 23.6358'
                      stroke='#5483D0'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M18 20.8969C14.8292 20.8969 12.1211 21.4064 12.1211 23.4416C12.1211 25.4758 14.8124 26 18 26C21.1707 26 23.8778 25.4957 23.8778 23.4594C23.8778 21.4232 21.1875 20.8969 18 20.8969Z'
                      stroke='#5483D0'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M18.0001 17.9922C20.0807 17.9922 21.7677 16.204 21.7677 13.9961C21.7677 11.7893 20.0807 10 18.0001 10C15.9195 10 14.2324 11.7893 14.2324 13.9961C14.2246 16.1956 15.8987 17.9849 17.9725 17.9922H18.0001Z'
                      stroke='#5483D0'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M12.0794 16.955C10.7022 16.75 9.64358 15.4985 9.64062 13.9823C9.64062 12.4881 10.6676 11.2492 12.0143 11.0148'
                      stroke='#5483D0'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M10.2632 20.4642C8.93032 20.6756 8 21.1705 8 22.1908C8 22.8929 8.43803 23.3491 9.14637 23.6358'
                      stroke='#5483D0'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <rect
                      x='0.5'
                      y='0.5'
                      width='35'
                      height='35'
                      rx='17.5'
                      stroke='#5483D0'
                      strokeDasharray='2 2'
                    />
                  </svg>
                  <div className='flex flex-col gap-[10px]'>
                    <h1 className='text-xl font-semibold text-gray-900'>Purely Collaborative</h1>
                    <p className='text-gray-700 w-[487px]'>
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      es se cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint.
                    </p>
                  </div>
                </div>
                <div className='flex gap-[24px]'>
                  <HeartIcon />
                  <div className='flex flex-col gap-[10px]'>
                    <h1 className='text-xl font-semibold text-gray-900'>Support All Student</h1>
                    <p className='text-gray-700 w-[487px]'>
                      Duis aute irure dolor in reprehenderit in voluptate velit
                      es se cillum dolore eu fugiat nulla pariatur. Excepteur
                      sint.
                    </p>
                  </div>
                </div>
              </div>
              <div className='w-[454px] h-[330px] bg-gray-200 rounded-lg flex items-center justify-center'>
                <span className='text-gray-500'>Image Placeholder</span>
              </div>
            </div>
          </div>
        </div>
        <div className='h-[823px] w-[80vw] relative flex justify-center items-center'>
          <svg
            width='51'
            height='51'
            viewBox='0 0 51 51'
            fill='none'
            className='absolute left-[70px] bottom-[76.22px]'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M11.3581 19.9099L37.1499 15.9774L27.6597 40.28L11.3581 19.9099Z'
              stroke='#FBAA1C'
              strokeWidth='3'
            />
          </svg>
          <div className='flex flex-col gap-[60px]'>
            <h1 className='text-3xl font-bold text-center text-gray-900'>Our Professional Instructor</h1>
            <div className='flex gap-[24px]'>
              <div className='flex flex-col gap-[24px] hover:scale-105 transition-transform'>
                <div className='w-[200px] h-[200px] bg-gray-200 rounded-lg flex items-center justify-center'>
                  <span className='text-gray-500'>Jane Cooper</span>
                </div>
                <div className='text-center'>
                  <h1 className='text-xl font-semibold text-gray-900'>Jane Cooper</h1>
                  <p className='text-blue-400'>UX/UI Designer</p>
                </div>
              </div>
              <div className='flex flex-col gap-[24px] hover:scale-105 transition-transform'>
                <div className='w-[200px] h-[200px] bg-gray-200 rounded-lg flex items-center justify-center'>
                  <span className='text-gray-500'>Esther Howard</span>
                </div>
                <div className='text-center'>
                  <h1 className='text-xl font-semibold text-gray-900'>Esther Howard</h1>
                  <p className='text-blue-400'>Program Manager</p>
                </div>
              </div>
              <div className='flex flex-col gap-[24px] hover:scale-105 transition-transform'>
                <div className='w-[200px] h-[200px] bg-gray-200 rounded-lg flex items-center justify-center'>
                  <span className='text-gray-500'>Brooklyn Simmons</span>
                </div>
                <div className='text-center'>
                  <h1 className='text-xl font-semibold text-gray-900'>Brooklyn Simmons</h1>
                  <p className='text-blue-400'>Software Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='h-[742px] w-[100vw] relative'>
          <svg
            width='1356'
            height='630'
            viewBox='0 0 1356 630'
            className='absolute right-[0px]'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <circle cx='1260.17' cy='96.1741' r='13.1741' fill='#C6DCFF' />
            <path
              d='M13.843 609L8.83754 627.68'
              stroke='#2FAC61'
              strokeWidth='3'
              strokeLinecap='round'
            />
            <path
              d='M2.00035 615.837L20.6809 620.843'
              stroke='#2FAC61'
              strokeWidth='3'
              strokeLinecap='round'
            />
            <circle
              cx='1345.7'
              cy='44.7033'
              r='36.5'
              transform='rotate(-75 1345.7 44.7033)'
              fill='url(#paint0_linear_36_4312)'
            />
            <defs>
              <linearGradient
                id='paint0_linear_36_4312'
                x1='1310.73'
                y1='54.6461'
                x2='1378.43'
                y2='78.6754'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#95BEFF' />
                <stop offset='1' stopColor='#0040E6' />
              </linearGradient>
            </defs>
          </svg>
          <div className='flex flex-col gap-[60px]'>
            <h1 className='text-3xl font-bold text-center text-gray-900'>Our Graduates</h1>
            <div className='flex justify-center'>
              <div className='w-[737px] h-[309px] bg-blue-50 rounded-lg flex items-center justify-center'>
                <span className='text-gray-500'>Testimonial Carousel Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}