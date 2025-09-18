'use client'

import { useRouter } from "next/navigation"
import CourseFlowIcon from "../../assets/courseFlowIcon"

export default function Navbar() {
  const router = useRouter()

  const LoginButton = () => (
    <button
      className="w-[112px] h-[60px] rounded-[12px] bg-[#2F5FAC] text-white font-semibold text-base hover:bg-[#244a8f] transition-colors"
      onClick={() => router.push("/auth/login")}
    >
      Log in
    </button>
  )

  return (
    <header className="h-[88px] bg-white shadow-md flex items-center justify-center">
      <nav className="w-[80vw] flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <CourseFlowIcon className="w-[140px] sm:w-[160px] md:w-[180px] hover:scale-105 transition-transform" />
        </div>
        <div className="flex items-center space-x-8">
          <div
            className="text-base font-bold text-[#191C77] cursor-pointer hover:scale-105 transition-transform"
            onClick={() => router.push("/public/courses")}
          >
            Our Courses
          </div>
          <LoginButton />
        </div>
      </nav>
    </header>
  )
}
