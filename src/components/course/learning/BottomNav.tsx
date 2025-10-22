"use client";

import { Button } from "@/components/ui/button";

export default function BottomNav() {
  return (
    <div className="flex items-center justify-between py-6">
      <Button variant="link" className="text-[#2F5FAC] px-0 cursor-pointer">
        Previous Lesson
      </Button>
      <Button className="bg-[#2F5FAC] hover:bg-blue-700/90 px-6 py-6 cursor-pointer">
        Next Lesson
      </Button>
    </div>
  );
}
