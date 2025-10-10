// src/app/user/profile/page.tsx
import { createSupabaseServerClient } from "@/lib/createSupabaseServerClient";
import Footer from "@/components/ui/footer";
import BackgroundImage from "@/components/ui/background-image";
import ProfileForm from "./profile-form";
import UploadPhoto from "./upload-photo";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  
  // ใช้ getUser() แทน getSession() เพื่อให้ได้ข้อมูลล่าสุด
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return <p>Please log in</p>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, date_of_birth, education, role, photo_url")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email || '';

  return (
    <section className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center px-1 py-12">
        {/* Background */}
        <BackgroundImage
          src="/assets/bg-image.png"
          alt="background"
          className="absolute object-cover -z-10"
        />
        <h1 className="sm:text-h2 text-h3 mb-10">Profile</h1>

        <div className="flex flex-col sm:flex-row gap-2 max-w-4xl w-full">
          {/* ✅ ให้ UploadPhoto จัดการรูปทั้งหมด */}
          <UploadPhoto profile={profile}/>

          {/* ฟอร์ม */}
          <ProfileForm profile={profile} email={email} />
        </div>
      </main>
      <Footer />
    </section>
  );
}
