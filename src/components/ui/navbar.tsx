'use client'

import { useRouter } from "next/navigation"
import CourseFlowIcon from "../../assets/courseFlowIcon"

export default function Navbar() {
  const router = useRouter()

  return (
    <header className="h-[88px] bg-white shadow-md flex items-center justify-center">
      <nav className="w-[80vw] flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <CourseFlowIcon className="w-[140px] sm:w-[160px] md:w-[180px] hover:scale-105 transition-transform" />
        </div>
        <div className="flex items-center justify-between gap-15">
          <div
            className="text-base font-bold text-[#191C77] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => router.push("/public/courses")}
          >
            Our Courses
          </div>
          <div
            className="w-[112px] h-[60px] rounded-[12px] bg-[#2F5FAC] text-white font-semibold text-base cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
            onClick={() => router.push("/auth/login")}
          >
            Log in
          </div>
        </div>
      </nav>
    </header>
  )
}