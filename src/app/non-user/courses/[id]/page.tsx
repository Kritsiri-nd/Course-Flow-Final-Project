"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PiBookOpenLight } from "react-icons/pi";
import { LuClock3, LuPlay, LuArrowLeft } from "react-icons/lu";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/ui/footer";
import SubscribeModalAlert from "@/components/ui/subscribe-modal-alert";

// Shape used in the UI
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
  durationHours: number;
  summary: string;
  modules: {
    id: number;
    title: string;
    lessons: string[];
  }[];
}

// API response shape from /api/courses and /api/courses/[id]
// Fields are snake_case and lessons are objects
type ApiLesson = {
  id: number;
  title: string;
  order_index?: number | null;
  created_at?: string | null;
};

type ApiModule = {
  id: number;
  title: string;
  order_index?: number | null;
  created_at?: string | null;
  lessons?: ApiLesson[] | null;
};

type ApiCourse = {
  id: number;
  category: string;
  title: string;
  description: string;
  price: number | string;
  currency: string;
  thumbnail: string | null;
  video_url?: string | null;
  instructor: string | null;
  duration_hours?: number | null;
  summary?: string | null;
  created_at?: string | null;
  modules?: ApiModule[] | null;
};

function mapApiCourseToUiCourse(api: ApiCourse): Course {
  const safeNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const n = Number(value);
      return Number.isNaN(n) ? fallback : n;
    }
    return fallback;
  };

  const modules = (api.modules ?? [])
    .slice()
    .sort((a, b) => safeNumber(a.order_index, 0) - safeNumber(b.order_index, 0))
    .map((m) => ({
      id: m.id,
      title: m.title,
      lessons: (m.lessons ?? [])
        .slice()
        .sort(
          (a, b) => safeNumber(a.order_index, 0) - safeNumber(b.order_index, 0)
        )
        .map((l) => l.title),
    }));

  return {
    id: api.id,
    category: api.category,
    title: api.title,
    description: api.description,
    summary: api.summary ?? "",
    price: safeNumber(api.price, 0),
    currency: api.currency,
    thumbnail: api.thumbnail ?? "",
    videoUrl: api.video_url ?? "",
    instructor: api.instructor ?? "",
    durationHours: safeNumber(api.duration_hours ?? 0, 0),
    modules,
  };
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
          const courseData: ApiCourse = await courseRes.json();
          setCourse(mapApiCourseToUiCourse(courseData));
        }

        // Fetch all courses for "Other Interesting Courses" section
        const allCoursesRes = await fetch("/api/courses");
        if (allCoursesRes.ok) {
          const allCoursesData: ApiCourse[] = await allCoursesRes.json();
          const mapped = allCoursesData.map(mapApiCourseToUiCourse);
          // Filter out current course
          const filtered = mapped.filter((c) => c.id !== parseInt(id));
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
          <h2 className="text-h3 font-bold text-foreground mb-2">
            Course not found
          </h2>
          <p className="text-b2 text-muted-foreground">
            The course you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );

  // const totalLessons = course.modules.reduce(
  //   (acc, module) => acc + module.lessons.length,
  //   0
  // );

  return (
    <>
      <div className="bg-white pt-2 pb-8 sm:pb-16 sm:pt-16 px-2 sm:px-6 md:px-8">
        {/* Back Button */}
        <div className="border-none mb-3">
          <div className="max-w-[1240px] mx-auto">
            <Link href="/non-user/courses">
              <Button variant="ghost" className="gap-2 text-b2 text-blue-500">
                <LuArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto">
          {/* Video + Sidebar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2 space-y-6">
              {/* Video/Image */}
              <div className="relative">
                <Card className="overflow-hidden !p-0">
                  <div
                    className="relative aspect-video !m-0"
                    style={{
                      aspectRatio: "739/460",
                    }}
                  >
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover !m-0 !p-0"
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
              <div className="space-y-6 mt-6 sm:mt-20">
                {/* Course Detail Text */}
                <div className="space-y-4">
                  <h2 className="sm:text-h2 text-h3 font-semibold">
                    Course Detail
                  </h2>
                  <div className="text-b2 text-muted-foreground leading-relaxed space-y-4 mt-4 sm:mt-8">
                    <p>{course.description}</p>
                  </div>
                </div>

                {/* Module Samples */}
                <div className="space-y-4 mt-6 sm:mt-20">
                  <h2 className="sm:text-h2 text-h3 font-semibold">
                    Module Samples
                  </h2>
                  <Accordion type="multiple" className="space-y-0 mt-4 sm:mt-8">
                    {course.modules.map((module, index) => (
                      <AccordionItem
                        key={module.id}
                        value={`module-${index}`}
                        className="!border-b !border-gray-200"
                      >
                        <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]>svg]:rotate-180">
                          <span className="text-b2 font-medium text-left">
                            {String(index + 1).padStart(2, "0")}. {module.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 border-t">
                          {module.lessons.length > 0 && (
                            <ul className="space-y-3 mt-3">
                              {module.lessons.map((lesson, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-3 text-b3 text-gray-500"
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

            {/* Sidebar - desktop and tablet*/}
            <div className="hidden md:block md:sticky md:top-24 md:self-start md:h-fit">
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
                      <span className="text-orange-500 text-b3">
                        {course.category}
                      </span>
                      <h3 className="text-h3 font-semibold mt-4">
                        {course.title}
                      </h3>
                      <p className="text-b3 text-gray-700 line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    {/* Middle Section - Price */}
                    <div>
                      <p className="mt-3 text-h3 font-bold text-gray-700">
                        {course.currency} {course.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Section - Buttons */}
                  <div className="space-y-3 pt-10 border-t border-gray-400">
                    <Button
                      variant="outline"
                      className="w-full py-6 bg-white border-orange-500 text-b2 text-orange-500 hover:bg-blue-50"
                    >
                      Add to Wishlist
                    </Button>
                    <SubscribeModalAlert
                      courseTitle={course.title}
                      onConfirm={() => {
                        // Add your subscription logic here
                        console.log(`Subscribing to course: ${course.title}`);
                        // You can add API calls, navigation, etc. here
                      }}
                    >
                      <Button className="w-full py-6 bg-primary hover:bg-primary/90 text-b2 text-primary-foreground">
                        Subscribe This Course
                      </Button>
                    </SubscribeModalAlert>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Other Interesting Courses */}
      <div className="bg-gray-100 py-8 sm:py-20">
        <div className="pt-0 sm:pt-10 sm:px-6 md:px-8 mx-auto max-w-[1240px] w-full">
          <h2 className="sm:text-h2 text-h3 font-semibold text-center mb-6 sm:mb-14">
            Other Interesting Courses
          </h2>
          <div className="mt-0 sm:mt-10 px-2 sm:px-4 md:px-6 lg:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCourses.slice(0, 3).map((c) => {
              const courseLessons = c.modules.reduce(
                (acc, m) => acc + m.lessons.length,
                0
              );
              const firstSentence = (c.description || "").split(".")[0] + ".";
              return (
                <Link key={c.id} href={`/non-user/courses/${c.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer h-full flex flex-col">
                    {/* Thumbnail */}
                    <Image
                      src={c.thumbnail}
                      alt={c.title}
                      width={400}
                      height={240}
                      className="w-full h-60 object-cover"
                    />

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow">
                      <p className="text-orange-500 text-b3 pb-4">
                        {c.category}
                      </p>
                      <h2 className="text-h3 text-black pb-4">{c.title}</h2>

                      {/* Description */}
                      <p className="text-b2 text-gray-700 flex-grow leading-relaxed">
                        {firstSentence}
                      </p>

                      <div className="border-t border-gray-200 my-4 w-full"></div>

                      {/* Lesson + Hours (stick to bottom) */}
                      <div className="flex items-center gap-6 mt-auto">
                        <div className="flex items-center gap-1">
                          <PiBookOpenLight className="size-5 text-blue-600" />
                          <span className="text-b2 text-gray-700">
                            {courseLessons} Lessons
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <LuClock3 className="size-5 text-blue-600" />
                          <span className="text-b2 text-gray-700">
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

      {/* Footer */}
      <Footer />

      {/* Sidebar - mobile floating bottom */}
      <div className="sticky bottom-0 block sm:hidden bg-white rounded-t-lg z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="course" className="border-none">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <AccordionTrigger className="hover:no-underline py-0 gap-2 group">
                    <div className="text-left flex flex-col gap-2">
                      {/* Tag that appears when expanded */}
                      <p className="text-orange-500 text-b4 group-data-[state=closed]:hidden">
                        {course?.category}
                      </p>
                      <h3 className="text-b2 text-black">
                        {course?.title || "Service Design Essentials"}
                      </h3>
                    </div>
                  </AccordionTrigger>
                </div>
              </div>
              <AccordionContent className="pt-2 pb-0">
                <div className="space-y-3">
                  <p className="text-b4 text-gray-700">{course?.summary}</p>
                </div>
              </AccordionContent>
              <div className="pt-2">
                <p className="text-b2 text-gray-700">
                  {course?.currency}{" "}
                  {course?.price?.toLocaleString() || "3,559.00"}
                </p>
                <div className="flex gap-3 mt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-500 !text-orange-500 hover:bg-orange-50 text-b4"
                  >
                    Add to Wishlist
                  </Button>
                  <SubscribeModalAlert
                    courseTitle={course?.title || "Service Design Essentials"}
                    onConfirm={() => {
                      console.log(`Subscribing to course: ${course?.title}`);
                    }}
                  >
                    <Button className="flex-1 bg-primary hover:bg-primary/90 !text-primary-foreground text-b4">
                      Subscribe This Course
                    </Button>
                  </SubscribeModalAlert>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
