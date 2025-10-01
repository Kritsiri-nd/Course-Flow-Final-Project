'use client';

import { useState } from 'react';
import UserProfileCard from '@/components/ui/UserProfileCard';
import CourseCard from '@/components/ui/CourseCard';

type TabType = 'all' | 'in-progress' | 'completed';

interface CourseData {
  id: string;
  title: string;
  description: string;
  image: string;
  lessonsCount: number;
  hoursCount: number;
  status?: 'in-progress' | 'completed';
}

interface UserData {
  name: string;
  photo: string;
  coursesInProgress: number;
  coursesCompleted: number;
}

interface MyCoursesClientProps {
  userData: UserData;
  courses: CourseData[];
}

export default function MyCoursesClient({ userData, courses }: MyCoursesClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs = [
    { id: 'all', label: 'All Courses' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ] as const;

  // กรอง courses ตาม tab ที่เลือก
  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    return course.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full opacity-30 -translate-x-16 -translate-y-16"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full opacity-30 translate-x-12 -translate-y-12"></div>
      <div className="absolute top-1/2 right-0 w-20 h-20 bg-blue-200 rounded-full opacity-30 translate-x-10"></div>

      <div className="relative py-6 sm:py-10 px-4 sm:px-6 md:px-10 lg:px-20 mx-auto max-w-[1240px] w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-h2 text-black">
            My Courses
          </h1>
        </div>

        {/* Navigation tabs */}
        <div className="flex justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-b2 transition-colors pb-2 relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* User profile card */}
          <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-start">
            <UserProfileCard
              userName={userData.name}
              userImage={userData.photo}
              coursesInProgress={userData.coursesInProgress}
              coursesCompleted={userData.coursesCompleted}
            />
          </div>

          {/* Course grid */}
          <div className="flex-1 flex justify-center lg:justify-start">
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-x-8 sm:gap-y-8 lg:gap-x-28 lg:gap-y-10 place-items-center sm:place-items-start">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    image={course.image}
                    lessonsCount={course.lessonsCount}
                    hoursCount={course.hoursCount}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {activeTab === 'all' 
                    ? 'No courses enrolled yet' 
                    : `No ${activeTab === 'in-progress' ? 'in progress' : 'completed'} courses`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

