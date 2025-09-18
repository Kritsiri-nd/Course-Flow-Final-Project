'use client'

import { useRouter } from "next/navigation"

export default function SubFooter() {
  const router = useRouter()
  
  return (
    <>
      <div className='flex flex-row justify-center h-[500px] relative bg-gradient-to-r from-blue-500 to-blue-700'>
        <footer className='w-[80vw] flex flex-row justify-between relative'>
          <div className='w-[40vw] flex flex-col justify-evenly items-start'>
            <h1 className='text-4xl font-bold text-white w-[70%]'>
              Interested in Becoming a Software Developer?
            </h1>
            <button
              className='bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform'
              onClick={() => {
                router.push("/public/courses");
              }}>
              Check Out Our Course
            </button>
          </div>

          <svg
            width='27'
            height='27'
            viewBox='0 0 27 27'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='absolute left-[406px] top-[403px]'>
            <circle
              cx='13.1741'
              cy='13.1741'
              r='11.6741'
              stroke='#2FAC8E'
              strokeWidth='3'
            />
          </svg>
          
          <div className='w-[40vw] self-end'>
            <div className='w-[592px] h-[448px] bg-white rounded-lg flex items-center justify-center'>
              <span className='text-gray-500 text-lg'>Course Image</span>
            </div>
            <svg
              width='37'
              height='37'
              viewBox='0 0 37 37'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='absolute top-[128px] right-[-55px]'>
              <path
                d='M34.9135 34.9134L2.46871 26.2199L26.22 2.4686L34.9135 34.9134Z'
                stroke='white'
                strokeWidth='2'
              />
            </svg>
          </div>
        </footer>
      </div>
    </>
  )
}
