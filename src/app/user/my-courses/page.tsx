'use client';

import { useState } from 'react';
import UserProfileCard from '@/components/ui/UserProfileCard';
import CourseCard from '@/components/ui/CourseCard';
import SubFooter from '@/components/ui/subFooter';
import Footer from '@/components/ui/footer';

// Sample course data
const sampleCourses = [
  {
    id: '1',
    title: 'Service Design Essentials',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    image: '/images/learning.png',
    lessonsCount: 6,
    hoursCount: 8,
  },
  {
    id: '2',
    title: 'Software Developer',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    image: '/images/learning.png',
    lessonsCount: 6,
    hoursCount: 8,
  },
  {
    id: '3',
    title: 'UX/UI Design Beginner',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    image: '/images/learning.png',
    lessonsCount: 6,
    hoursCount: 8,
  },
  {
    id: '4',
    title: 'Service Design Essentials',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    image: '/images/learning.png',
    lessonsCount: 6,
    hoursCount: 8,
  },
  {
    id: '5',
    title: 'UX/UI Design Beginner',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    image: '/images/learning.png',
    lessonsCount: 6,
    hoursCount: 8,
  },
];

type TabType = 'all' | 'in-progress' | 'completed';

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const tabs = [
    { id: 'all', label: 'All Courses' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full opacity-30 -translate-x-16 -translate-y-16"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full opacity-30 translate-x-12 -translate-y-12"></div>
      <div className="absolute top-1/2 right-0 w-20 h-20 bg-blue-200 rounded-full opacity-30 translate-x-10"></div>

      <div className="relative py-10 px-4 sm:px-6 md:px-10 lg:px-20 mx-auto max-w-[1240px] w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-black text-h2 font-inter">My Courses</h1>
        </div>

        {/* Navigation tabs */}
        <div className="flex justify-center gap-8 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-b2 font-medium transition-colors pb-2 relative ${
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
        <div className="flex gap-12">
          {/* User profile card */}
          <div className="flex-shrink-0">
            <UserProfileCard
              userName="Max Mayfield"
              userImage="/images/woman.png"
              coursesInProgress={3}
              coursesCompleted={2}
            />
          </div>

          {/* Course grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              {sampleCourses.map((course) => (
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
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
