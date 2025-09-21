'use client'

import { useRouter } from "next/navigation"
import CourseFlowIcon from "../../assets/courseFlowIcon"

export default function Navbar() {
  const router = useRouter()

  return (
    <header className="h-[88px] bg-white shadow-md flex items-center justify-center">
      <nav className="w-[90vw] sm:w-[80vw] flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <CourseFlowIcon className="w-[117px] h-[13px] sm:w-[140px] sm:h-[16px] md:w-[160px] md:h-[18px] lg:w-[180px] lg:h-[20px] hover:scale-105 transition-transform" />
        </div>
        <div className="flex items-center justify-between gap-6 sm:gap-15">
          <div
            className="font-inter font-bold text-[14px] leading-[150%] text-center text-[#191C77] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => router.push("/non-user/courses")}
          >
            Our Courses
          </div>
          <div
            className="w-[90px] h-[50px] sm:w-[112px] sm:h-[60px] rounded-[12px] bg-[#2F5FAC] text-white font-semibold text-sm sm:text-base cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
            onClick={() => router.push("/auth/login")}
          >
            Log in
          </div>
        </div>
      </nav>
    </header>
  )
}