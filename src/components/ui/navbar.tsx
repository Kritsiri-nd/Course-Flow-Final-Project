'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import CourseFlowIcon from "../../assets/courseFlowIcon"
import PeopleIcon from "../../assets/peopleIcon"
import BookIcon from "../../assets/bookIcon"
import CopyIcon from "../../assets/copyIcon"
import StarIcon from "../../assets/starIcon"
import LogoutIcon from "../../assets/logoutIcon"

export default function Navbar() {
  const router = useRouter()
  const [userImage, setUserImage] = useState("")
  const [userName, setUserName] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedIsLoggedIn = localStorage.getItem("isLoggedIn")
      const storedUsername = localStorage.getItem("username")
      const storedUserImage = localStorage.getItem("userimage")
      if (storedIsLoggedIn === "true") {
        setIsLoggedIn(true)
        setUserName(storedUsername || "")
        setUserImage(storedUserImage || "")
      }
    }
  }, [])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("username")
      localStorage.removeItem("userimage")
    }
    setIsLoggedIn(false)
    setUserName("")
    setUserImage("")
    router.push("/")
  }

  const LoginButton = ({ buttonText }: { buttonText: string }) => (
    <button
      className="px-6 py-3 border bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold"
      onClick={() => router.push("/auth/login")}
    >
      {buttonText}
    </button>
  )

  const AfterLogin = () => (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
        {userImage ? (
          <img src={userImage} alt={userName} className="w-8 h-8 rounded-full" />
        ) : (
          <span className="text-sm text-gray-600">{userName.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <p className="text-sm font-medium">{userName}</p>
      <BasicMenu />
    </div>
  )

  const BasicMenu = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="relative">
        <button 
          className="text-sm font-medium p-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          ▼
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-md p-2 border border-gray-200">
            <button 
              onClick={() => {
                router.push("/user/profile")
                setIsOpen(false)
              }} 
              className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              <PeopleIcon width="16px" height="16px" stroke="#8DADE0" />
              <span className="text-gray-700 font-medium text-sm">Profile</span>
            </button>
            <button 
              onClick={() => {
                router.push("/user/my-courses")
                setIsOpen(false)
              }} 
              className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              <BookIcon width="16px" height="16px" stroke="#8DADE0" />
              <span className="text-gray-700 font-medium text-sm">My Course</span>
            </button>
            <button 
              onClick={() => {
                router.push("/user/assignments")
                setIsOpen(false)
              }} 
              className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              <CopyIcon width="16px" height="16px" stroke="#8DADE0" />
              <span className="text-gray-700 font-medium text-sm">My Homework</span>
            </button>
            <button 
              onClick={() => {
                router.push("/user/wishlist")
                setIsOpen(false)
              }} 
              className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              <StarIcon width="16px" height="16px" stroke="#8DADE0" />
              <span className="text-gray-700 font-medium text-sm">My Desire Courses</span>
            </button>
            <hr className="my-2 border-gray-200" />
            <button 
              onClick={() => {
                handleLogout()
                setIsOpen(false)
              }} 
              className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              <LogoutIcon width="16px" height="16px" stroke="#646D89" />
              <span className="text-gray-700 font-medium text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-row justify-center shadow-lg h-[88px] bg-white">
      <nav className="flex flex-row justify-between items-center w-[80vw]">
        <div
          className="cursor-pointer"
          onClick={() => router.push("/")}
        >
          <CourseFlowIcon />
        </div>

        <div className="flex flex-row items-center space-x-8">
          <div
            className="text-base font-bold cursor-pointer hover:scale-105 transition-transform text-gray-800"
            onClick={() => router.push("/public/courses")}
          >
            Our Courses
          </div>
          {isLoggedIn && userName ? (
            <div className="flex flex-row justify-center items-center space-x-3">
              <AfterLogin />
            </div>
          ) : (
            <LoginButton buttonText="Log in" />
          )}
        </div>
      </nav>
    </div>
  )
}