'use client';

import Image from 'next/image';
import { PiBookOpenLight } from 'react-icons/pi';
import { LuClock3 } from 'react-icons/lu';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  lessonsCount: number;
  hoursCount: number;
  category?: string;
}

export default function CourseCard({
  id,
  title,
  description,
  image,
  lessonsCount,
  hoursCount,
  category = 'Course',
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer h-full flex flex-col">
      {/* Thumbnail */}
      <div className="relative w-full h-60">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-orange-500 text-b3 pb-4">{category}</p>
        <h3 className="text-h3 text-black pb-4">{title}</h3>

        {/* Description */}
        <p className="text-b2 text-gray-700 flex-grow leading-relaxed">{description}</p>

        <div className="border-t border-gray-200 my-4 w-full"></div>

        {/* Lesson + Hours */}
        <div className="flex items-center gap-6 mt-auto">
          <div className="flex items-center gap-1">
            <PiBookOpenLight className="size-5 text-blue-600" />
            <span className="text-b2 text-gray-700">{lessonsCount} Lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <LuClock3 className="size-5 text-blue-600" />
            <span className="text-b2 text-gray-700">{hoursCount} Hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
