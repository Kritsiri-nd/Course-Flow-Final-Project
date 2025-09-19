"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Course {
  id: number;
  name: string;
  description: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) {
        console.error("Error fetching courses:", error.message);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-headline2 font-headline mb-4">Courses</h1>
      {courses.length === 0 && <p>No courses found.</p>}
      <ul className="space-y-4">
        {courses.map((c) => (
          <li key={c.id} className="p-4 border rounded shadow-shadow1">
            <h2 className="text-body1 font-bold">{c.name}</h2>
            <p className="text-body2 text-gray-700">{c.description}</p>
          </li>
        ))}
      </ul>
      <div>
        <p className="text-headline1">Test Headline1</p>
        <p className="text-headline2">Test Headline2</p>
        <p className="text-headline3">Test Headline3</p>
        <p className="text-body1">Test Body1</p>
        <p className="text-body2">Test Body2</p>
        <p className="text-body3">Test Body3</p>
        <p className="text-body4">Test Body4</p>
      </div>
    </div>
  );
}