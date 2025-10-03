'use client';

import Image from 'next/image';
import Link from 'next/link';
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
    <Link href={`/non-user/courses/${id}`} className="block">
      <div className="w-[357px] h-[475px] bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer flex flex-col relative">

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
        <div className="flex flex-col flex-grow p-6 gap-6">
          <div className="flex flex-col gap-4">
            <p className="text-orange-500 text-b3">{category}</p>
            <h3 className="text-h3 text-black">{title}</h3>
          </div>

          {/* Description */}
          <p className="text-b2 text-gray-700 flex-grow leading-relaxed">{description}</p>


          <div className="border-t border-gray-200 w-full"></div>

          {/* Lesson + Hours */}
          <div className="flex items-center gap-6">
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
    </Link>
  );
}
