// src/app/user/profile/page.tsx
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import Footer from "@/components/ui/footer";
import ProfileForm from "./profile-form";
import UploadPhoto from "./upload-photo"; // component ใหม่

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return <p>Please log in</p>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, date_of_birth, education, role, photo_url")
    .eq("id", session.user.id)
    .maybeSingle();

  const email = session.user.email;
  const avatarSrc = profile?.photo_url || "/assets/defaultUser.png";

  return (
    <section className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        <h1 className="text-h2 mb-10">Profile</h1>

        <div className="flex flex-row gap-12 max-w-4xl w-full">
          {/* User photo + ปุ่ม */}
          <div className="flex flex-col items-center">
            <div className="w-[200px] h-[200px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={avatarSrc}
                alt="User photo"
                width={200}
                height={200}
                className="object-cover"
              />
            </div>

            {/* ปุ่ม upload/remove */}
            <UploadPhoto profile={profile} />
          </div>

          {/* Form */}
          <ProfileForm profile={profile} email={email} />
        </div>
      </main>
      <Footer />
    </section>
  );
}
