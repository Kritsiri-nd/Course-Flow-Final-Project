"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PiBookOpenLight, PiStarFill } from "react-icons/pi";
import { LuClock3, LuPlay, LuArrowLeft } from "react-icons/lu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Course {
  id: number;
  category: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  thumbnail: string;
  videoUrl: string;
  instructor: string;
  rating: number;
  students: number;
  language: string;
  durationHours: number;
  modules: {
    id: number;
    title: string;
    lessons: string[];
  }[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [otherCourses, setOtherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Fetch specific course
        const courseRes = await fetch(`/api/courses/${id}`);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse(courseData);
        }

        // Fetch all courses for "Other Interesting Courses" section
        const allCoursesRes = await fetch("/api/courses");
        if (allCoursesRes.ok) {
          const allCoursesData = await allCoursesRes.json();
          // Filter out current course
          const filtered = allCoursesData.filter(
            (c: Course) => c.id !== parseInt(id)
          );
          setOtherCourses(filtered);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Course not found
          </h2>
          <p className="text-muted-foreground">
            The course you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-16 px-8">
        {/* Back Button */}
        <div className="border-none mb-3">
          <div className="max-w-[1240px] mx-auto">
            <Link href="/non-user/courses">
              <Button variant="ghost" className="gap-2 text-lg text-blue-500">
                <LuArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto">
          {/* Video + Sidebar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Video/Image */}
              <div className="relative">
                <Card className="overflow-hidden !p-0">
                  <div
                    className="relative aspect-video !m-0"
                    style={{
                      aspectRatio: "739/460",
                    }}
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover !m-0 !p-0"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Button
                        size="lg"
                        className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-blue-600 shadow-lg"
                      >
                        <LuPlay className="w-6 h-6 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Course Details - ย้ายไปด้านล่าง */}
              <div className="space-y-6 mt-20">
                {/* Course Detail Text */}
                <div className="space-y-4">
                  <h2 className="text-4xl font-semibold">Course Detail</h2>
                  <div className="text-muted-foreground leading-relaxed space-y-4 mt-8">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Elementum tempus hendrerit eget et, ultrices erat ut
                      tellus massa. Nam venenatis diam, leo. Mauris bibendum at
                      mauris rhoncus. Sed scelerisque quam et ante finibus
                      rutrum. Vivamus aliquam, dictum ex quis facilisis id
                      sodales augue molestie amet lorem posuere.
                    </p>
                    <p>
                      Vel, elit magna sed cum non cursus, sed elit et
                      ullamcorper magna. Duis sed sapien est, dignissim eget
                      nibh vestibulum enim placerat convallis. Mauris bibendum
                      erat sed magna, ac rutrum ex. Sed vulputate pretium et
                      neque molestie maximus. Pellentesque lacinia mi tellus
                      lorem elementum et consequat lacinia lacus massa.
                      Vestibulum molestie elit ut quam ante. Vestibulum
                      scelerisque consectetur.
                    </p>
                    <p>
                      Eros, ut mattis a et porttitor ante lorem. Pellentesque
                      pharetra non risus at et. Ut rutrum lacus sed mollit, sed
                      tincidunt tempor facilisis mattis. Sed sed sem in suscipit
                      volutpat rutrum lacus eget porta et. Et dictum molestie.
                      Quis eget consectetur faucibus molestaque sed. Et tellus
                      molestie expedita libero eget rutrum ligula sagittis. Et
                      risus, tellus rutrum non.
                    </p>
                  </div>
                </div>

                {/* Module Samples */}
                <div className="space-y-4 mt-20">
                  <h2 className="text-4xl font-semibold">Module Samples</h2>
                  <Accordion
                    type="single"
                    collapsible
                    className="space-y-0 mt-8"
                  >
                    {course.modules.map((module, index) => (
                      <AccordionItem
                        key={module.id}
                        value={`module-${index}`}
                        className="!border-b !border-gray-200"
                      >
                        <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]>svg]:rotate-180">
                          <span className="text-base font-medium text-left">
                            {String(index + 1).padStart(2, "0")}. {module.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 border-t">
                          {module.lessons.length > 0 && (
                            <ul className="space-y-3 mt-3">
                              {module.lessons.map((lesson, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-3 text-sm text-gray-500"
                                >
                                  <div className="w-1 h-1 bg-gray-500 rounded-full flex-shrink-0"></div>
                                  <span>{lesson}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>

            {/* Sidebar - responsive แต่รักษา ratio ตาม Figma */}
            <div className="space-y-6 md:sticky md:top-24 md:self-start md:h-fit">
              <Card className="!p-0">
                <div
                  className="flex flex-col justify-between gap-8"
                  style={{
                    aspectRatio: "357/449",
                    padding: "32px 24px",
                  }}
                >
                  <div>
                    {/* Top Section */}
                    <div className="space-y-3">
                      <span className="text-orange-500 text-sm">
                        {course.category}
                      </span>
                      <h3 className="text-xl font-semibold mt-4">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    {/* Middle Section - Price */}
                    <div>
                      <p className="mt-3 text-2xl font-bold text-gray-700">
                        {course.currency} {course.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Section - Buttons */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full py-6 border-orange-500 text-orange-500 hover:bg-blue-50"
                    >
                      Add to Wishlist
                    </Button>
                    <Button className="w-full py-6 bg-blue-500 hover:bg-blue-600">
                      Subscribe This Course
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Other Interesting Courses */}
      <div className="bg-gray-100 py-20">
        <div className="pt-10 px-4 sm:px-6 md:px-10 lg:px-20 mx-auto max-w-[1240px] w-full">
          <h2 className="text-4xl font-semibold text-center mb-14">
            Other Interesting Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
            {otherCourses.slice(0, 3).map((c) => {
              const courseLessons = c.modules.reduce(
                (acc, m) => acc + m.lessons.length,
                0
              );
              return (
                <Link key={c.id} href={`/non-user/courses/${c.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
                    {/* Thumbnail */}
                    <img
                      src={c.thumbnail}
                      alt={c.title}
                      className="w-full h-60 object-cover rounded"
                    />

                    {/* Content */}
                    <div className="p-4">
                      <span className="text-orange-500 text-body3 font-medium">
                        {c.category}
                      </span>
                      <h2 className="text-headline3 text-black mt-1">
                        {c.title}
                      </h2>
                      <p className="text-body2 text-gray-700 mt-1">
                        {c.description}
                      </p>
                      <div className="border-t border-gray-200 my-4 w-full"></div>

                      {/* Lesson + Hours */}
                      <div className="flex items-center gap-6 mt-4 text-gray-700 text-sm">
                        <div className="flex items-center gap-1">
                          <PiBookOpenLight className="size-5 text-blue-600" />
                          <span className="text-body2 text-gray-700">
                            {courseLessons} Lessons
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <LuClock3 className="size-5 text-blue-600" />
                          <span className="text-body2 text-gray-700">
                            {c.durationHours} Hours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
