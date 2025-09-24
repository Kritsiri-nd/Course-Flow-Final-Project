"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PiBookOpenLight } from "react-icons/pi";
import { LuClock3 } from "react-icons/lu";
import Link from "next/link";
import Navbar from "@/components/ui/navbar";
import SubFooter from "@/components/ui/subFooter";
import Footer from "@/components/ui/footer";

export default function CourseList() {
  const [courses, setCourses] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // ✅ กำหนดจำนวนคอร์สต่อหน้า

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/courses");
      if (!res.ok) return;
      const data = await res.json();
      setCourses(data);
    };
    fetchCourses();
  }, []);

  if (!courses.length) return <p>Loading...</p>;

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.description.toLowerCase().includes(query.toLowerCase()) ||
      course.category.toLowerCase().includes(query.toLowerCase())
  );

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <section>
      
    <div className="relative py-10 px-4 sm:px-6 md:px-10 lg:px-20 mx-auto max-w-[1240px] w-full">
      {/* Background */}
      <Image
        src="/assets/bg-image.png"
        alt="background"
        width={1240}
        height={300}
        priority
        className="absolute object-cover -z-10 "
      />

      <div className="flex flex-col items-center gap-8">
        <h1 className="text-black text-h2 font-inter">Our Courses</h1>

        {/* Search Bar */}
        <div className="flex items-center border pl-3 gap-3 bg-white border-gray-300 h-[46px] rounded-md max-w-md w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 30 30"
            fill="#6B7280"
          >
            <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-full outline-none text-gray-500 placeholder-gray-500 text-[16px]"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1); // ✅ รีเซ็ต pagination เมื่อ search
            }}
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="mt-10 px-2 sm:px-4 md:px-6 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCourses.length > 0 ? (
          paginatedCourses.map((course) => {
            const firstSentence = course.description.split(".")[0] + ".";
            return (
              <Link key={course.id} href={`/non-user/courses/${course.id}`}>
  <div className="bg-white rounded-lg shadow hover:shadow-lg transition 
                  overflow-hidden cursor-pointer h-full flex flex-col">
    {/* Thumbnail */}
    <img
      src={course.thumbnail}
      alt={course.title}
      className="w-full h-60 object-cover"
    />

    {/* Content */}
    <div className="p-4 flex flex-col flex-grow">
      <p className="text-orange-500 text-b3 pb-4">{course.category}</p>
      <h2 className="text-h3 text-black pb-4">{course.title}</h2>

      {/* Description */}
      <p className="text-b2 text-gray-700 flex-grow leading-relaxed">{firstSentence}</p>

      <div className="border-t border-gray-200 my-4 w-full"></div>

      {/* Lesson + Hours (ดันลงล่างสุดเสมอ) */}
      <div className="flex items-center gap-6 mt-auto">
        <div className="flex items-center gap-1">
          <PiBookOpenLight className="size-5 text-blue-600" />
          <span className="text-b2 text-gray-700">
            {(course.modules ?? []).reduce(
              (acc, m) => acc + (m.lessons?.length ?? 0),
              0
            )}{" "}
            Lessons
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LuClock3 className="size-5 text-blue-600" />
          <span className="text-b2 text-gray-700">
            {course.durationHours} Hours
          </span>
        </div>
      </div>
    </div>
  </div>
</Link>

            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No courses found
          </p>
        )}
      </div>

      {/* ✅ Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
    <SubFooter/>
    <Footer/>
    </section>
  );
}
