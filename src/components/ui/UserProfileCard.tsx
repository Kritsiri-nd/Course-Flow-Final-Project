'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';

interface UserProfileCardProps {
  userName: string;
  userImage: string;
  coursesInProgress: number;
  coursesCompleted: number;
}

export default function UserProfileCard({
  userName,
  userImage,
  coursesInProgress,
  coursesCompleted,
}: UserProfileCardProps) {
  return (
    <div className="relative">
      {/* Profile card */}
      <div className="bg-white box-shadow1 w-[357px] h-[396px] rounded-lg pt-8 pr-6 pb-8 pl-6">
        {/* Profile image */}
        <div className="flex justify-center mb-4">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden">
            <Image
              src={userImage}
              alt={userName}
              width={120}
              height={120}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* User name */}
        <h3 className="text-center font-inter font-medium text-[24px] leading-[125%] tracking-[-0.02em] text-gray-800 mb-6">
          {userName}
        </h3>

        {/* Stats */}
        <div className="flex gap-6">
          <div className="text-left bg-[#F1F2F6] rounded-lg w-[142.5px] h-[134px] p-4 flex flex-col justify-between">
            <p className="font-inter font-normal text-[16px] leading-[150%] tracking-[0%] text-gray-700">Course <br />In Progress</p>
            <p className="font-inter font-medium text-[24px] leading-[125%] tracking-[-0.02em] text-black">{coursesInProgress}</p>
          </div>
          <div className="text-left bg-[#F1F2F6] rounded-lg w-[142.5px] h-[134px] p-4 flex flex-col justify-between">
            <p className="font-inter font-normal text-[16px] leading-[150%] tracking-[0%] text-gray-700">Course <br />Complete</p>
            <p className="font-inter font-medium text-[24px] leading-[125%] tracking-[-0.02em] text-black">{coursesCompleted}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
