'use client';

import Link from 'next/link';
import { Session } from '@supabase/supabase-js';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; 

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NonuserNav from './NonuserNav';
import CourseFlowIcon from '@/assets/courseFlowIcon';

// --- Icon Components ---
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const CoursesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
const AssignmentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>;
const WishlistIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;

// --- Type Definitions ---
type Profile = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string | null;
} | null;

// --- Main Component ---
export default function UserNav({ session, userProfile, onLogout }: { session: Session | null, userProfile: Profile, onLogout: () => void }) {
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {

    await supabase.auth.signOut();
    router.refresh();
    // router.push('/auth/login');
  }

  
  return (
    <header className="flex h-[88px] items-center justify-center bg-white font-sans shadow-md">
      <nav className="flex w-[90vw] items-center justify-between sm:w-[80vw]">
        
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <CourseFlowIcon className="h-[13px] w-[117px] transition-transform hover:scale-105 sm:h-[16px] sm:w-[140px] md:h-[18px] md:w-[160px] lg:h-[20px] lg:w-[180px]" />
        </div>

        {/* Navigation Links & User Menu */}
        <div className="flex items-center justify-between gap-6 sm:gap-15">
          <div
            className="cursor-pointer text-center font-inter text-[16px] font-bold leading-[150%] text-[#191C77] transition-transform hover:scale-105"
            onClick={() => router.push("/non-user/courses")}
          >
            Our Courses
          </div>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 text-gray-600 hover:text-blue-600 focus:outline-none">
                <Image
                  src={userProfile?.avatar_url || '/default-avatar.png'}
                  alt={userProfile?.first_name || 'User Avatar'}
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

            <DropdownMenuContent className="w-56 font-sans" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/user/profile" className="flex cursor-pointer items-center gap-3 font-sans">
                  <ProfileIcon /> <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/user/my-courses" className="flex cursor-pointer items-center gap-3 font-sans">
                  <CoursesIcon /> <span>My Courses</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/user/assignments" className="flex cursor-pointer items-center gap-3 font-sans">
                  <AssignmentsIcon /> <span>My Assignments</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/user/wishlist" className="flex cursor-pointer items-center gap-3 font-sans">
                  <WishlistIcon /> <span>My Wishlist</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-3 font-sans text-red-600 focus:text-red-600"
              >
                <LogoutIcon /> <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}