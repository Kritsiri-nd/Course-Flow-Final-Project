"use client";

import LearningSidebar from "@/components/course/learning/LearningSidebar";
import VideoSection from "@/components/course/learning/VideoSection";
import AssignmentCard from "@/components/course/learning/AssignmentCard";
import BottomNav from "@/components/course/learning/BottomNav";
import Footer from "@/components/ui/footer";

export default function UserCourseLearningPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-2 sm:px-6 md:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="order-2 md:order-1 md:col-span-1">
            <LearningSidebar />
          </div>
          <div className="order-1 md:order-2 md:col-span-2 space-y-6">
            <VideoSection />
            <AssignmentCard />
            <BottomNav />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
