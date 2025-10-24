"use client";

import { Button } from "@/components/ui/button";

export default function BottomNav() {
  return (
    <div className="flex items-center justify-between py-6">
      <Button variant="link" className="text-blue-500 px-0 cursor-pointer">
        Previous Lesson
      </Button>
      <Button className="btn-blue-500 px-6 py-6 cursor-pointer">
        Next Lesson
      </Button>
    </div>
  );
}
