'use client'

import { useRouter } from "next/navigation"
import CourseFlowIcon from "../../assets/courseFlowIcon"
import Image from "next/image"

export default function Footer() {
  const router = useRouter()
  
  return (
    <div className="w-full h-[240px] flex items-center" style={{ backgroundColor: '#183056' }}>
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
          <div 
            className="cursor-pointer"
            onClick={() => {
              router.push("/")
              window.scrollTo({ top: 0, left: 0, behavior: "auto" })
            }}
          >
            <img
              src="/images/courseflowicon.png"
              alt="CourseFlow Logo"
              width={140}
              height={40}
              className="hover:scale-105 transition-transform"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-20">
            <a
              href="#"
              className="text-[16px] font-normal leading-[150%] tracking-[0%] text-[#ACB4C3] hover:text-white transition-colors text-center"
              onClick={(e) => {
                e.preventDefault()
                router.push("/non-user/courses")
              }}
            >
              All Courses
            </a>
            <a
              href="#"
              className="text-[16px] font-normal leading-[150%] tracking-[0%] text-[#ACB4C3] hover:text-white transition-colors text-center"
              onClick={(e) => {
                e.preventDefault()
                router.push("/non-user/courses")
              }}
            >
              Bundle Package
            </a>
          </div>
          
          <div className="flex space-x-3">
            <a 
              href="https://www.facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/fb.png"
                alt="Facebook"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
                quality={100}
                priority
              />
            </a>
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/ig.png"
                alt="Instagram"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
              />
            </a>
            <a 
              href="https://www.twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
            >
              <Image
                src="/images/tw.png"
                alt="Twitter"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
