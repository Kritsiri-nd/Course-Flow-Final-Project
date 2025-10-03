"use client";

import { Button } from "@/components/ui/button";

export default function BottomNav() {
  return (
    <div className="flex items-center justify-between py-6">
      <Button variant="link" className="text-blue-700 px-0">
        Previous Lesson
      </Button>
      <Button className="bg-blue-700 hover:bg-blue-700/90 px-6">
        Next Lesson
      </Button>
    </div>
  );
}
