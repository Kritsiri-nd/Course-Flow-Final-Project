'use client';

import { useState } from 'react';
import CourseCard from '@/components/ui/CourseCard';

interface CourseData {
  id: string;
  title: string;
  description: string;
  image: string;
  lessonsCount: number;
  hoursCount: number;
  category?: string;
}

interface UserData {
  name: string;
  photo: string;
  coursesInProgress: number;
  coursesCompleted: number;
}

interface MyWishlistClientProps {
  userData: UserData;
  wishlistCourses: CourseData[];
}

export default function MyWishlistClient({ wishlistCourses }: MyWishlistClientProps) {
  const [courses] = useState<CourseData[]>(wishlistCourses);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6 sm:py-10 px-4 sm:px-6 md:px-10 lg:px-20 mx-auto max-w-[1240px] w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-h2 text-black">
            My Wishlist
          </h1>
        </div>

        {/* Main content */}
        <div className="flex justify-center">
          {/* Wishlist course grid */}
          <div className="flex justify-center lg:justify-start">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-x-8 sm:gap-y-8 lg:gap-x-28 lg:gap-y-10 place-items-center sm:place-items-start">
                {courses.map((course) => (
                  <div key={course.id}>
                    <CourseCard
                      id={course.id}
                      title={course.title}
                      description={course.description}
                      image={course.image}
                      lessonsCount={course.lessonsCount}
                      hoursCount={course.hoursCount}
                      category={course.category}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="64" 
                    height="64" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="mx-auto text-gray-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">
                  Start adding courses you&apos;re interested in to your wishlist
                </p>
                <button 
                  onClick={() => window.location.href = '/non-user/courses'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
