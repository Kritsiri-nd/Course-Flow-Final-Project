'use client'

import { useRouter } from "next/navigation"
// import CourseFlowIcon from "../../assets/courseFlowIcon"

import { Session } from  '@supabase/supabase-js'
import { createClient } from "@/lib/supabaseClient"

type profile = {
    first_name: string | null;
    last_name: string | null;
} | null;


export default function Navbar_test({ session , userProfile }: { session: Session | null , userProfile: profile }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
   
  };

  return (
    <header className="h-[88px] bg-white shadow-md flex items-center justify-center">
      <div>
        { session ? (
           <div className="flex items-center gap-4">
            <span>สวัสดีจ้าาาาา ,
               {session.user.email} {userProfile?.first_name || ''}</span>

            <button
                onClick={handleLogout}
                className="rounded bg-red-500 px-3 py-1 text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span>Please log in</span>
            <button
              onClick={() => router.push("/auth/login")}
              className="rounded bg-blue-500 px-3 py-1 text-white"
            >
              Login
            </button>
          </div>
        )}

      </div>

    </header>
  )
}