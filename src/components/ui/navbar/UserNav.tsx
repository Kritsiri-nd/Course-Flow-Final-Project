'use client';

import Link from 'next/link';
import { Session } from '@supabase/supabase-js';
import Image from 'next/image';
import NonuserNav from './NonuserNav'; // สมมติว่าไฟล์นี้อยู่ในโฟลเดอร์เดียวกัน

// 1. Import components จาก shadcn/ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- ไอคอนต่างๆ (คงไว้เหมือนเดิม) ---
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CoursesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const AssignmentsIcon = () => <svg xmlns="http://www.w.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const WishlistIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;

// 2. แก้ไข Type ของ Profile ให้ถูกต้อง
type Profile = {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: string | null;
} | null;

export default function UserNav({ session, userProfile, onLogout }: { session: Session | null, userProfile: Profile, onLogout: () => void }) {
  
  // 3. แก้ไข Logic การแสดงผลสำหรับ Non-User ให้ถูกต้อง
  if (!session) {
    return <NonuserNav />;
  }

  return (
    <DropdownMenu>
      {/* --- ส่วน Trigger ที่กดเพื่อเปิดเมนู --- */}
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Image
            src={userProfile?.avatar_url || '/default-avatar.png'}
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full border-2 border-gray-200"
          />
          <span className="hidden font-semibold sm:block">
            {userProfile?.first_name} {userProfile?.last_name}
          </span>
          <ChevronDownIcon />
        </button>
      </DropdownMenuTrigger>

      {/* --- ส่วน Content ของเมนูที่จะแสดงขึ้นมา --- */}
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* ใช้ asChild เพื่อให้ Link ทำงานได้เต็มประสิทธิภาพ */}
        <DropdownMenuItem asChild>
          <Link href="/user/profile" className="flex items-center gap-3 cursor-pointer">
            <ProfileIcon /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/my-courses" className="flex items-center gap-3 cursor-pointer">
            <CoursesIcon /> My Courses
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/assignments" className="flex items-center gap-3 cursor-pointer">
            <AssignmentsIcon /> My Assignments
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/wishlist" className="flex items-center gap-3 cursor-pointer">
            <WishlistIcon /> My Wishlist
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout} className="flex items-center gap-3 cursor-pointer text-red-600 focus:text-red-600">
          <LogoutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}