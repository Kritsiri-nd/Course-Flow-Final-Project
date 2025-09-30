"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import DeleteModalAlert from "@/components/ui/delete-modal-alert";

type Course = {
  id: number;
  title: string;
  category: string;
  price: number | string;
  currency: string;
  rating: number | string | null;
  students: number | null;
  language: string;
  duration_hours: number | null;
  thumbnail: string;
  modules?: { lessons?: Array<{ id: number }> }[];
  created_at?: string;
  updated_at?: string | null;
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) return;
        const data = await res.json();
        setCourses(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      [c.title, c.category, c.language].some((v) =>
        (v ?? "").toString().toLowerCase().includes(q)
      )
    );
  }, [courses, query]);

  const handleDelete = async (courseId: number) => {
    try {
      setDeletingId(courseId);
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete assignment");
      }

      // Remove from local state
      setCourses((prev) => prev.filter((a) => a.id !== courseId));
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert(
        `Failed to delete assignment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        {/* header */}
        <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-h3 font-semibold">Courses</h1>

          {/* searchbar & add course button */}
          <div className="ml-auto gap-4 flex items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="h-12 w-64 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link href="/admin/courses/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-15 rounded-lg px-8">
                <Plus className="h-4 w-4" />
                Add course
              </Button>
            </Link>
          </div>
        </header>

        {/* table */}
        <div className="rounded-lg border border-none overflow-x-auto bg-white m-10">
          <Table className="min-w-[960px]">
            <TableHeader>
              <TableRow className="bg-gray-300 border-none">
                <TableHead className="font-medium py-3 w-12 text-rigth"></TableHead>
                <TableHead className="font-medium py-3 w-36 text-rigth">
                  Image
                </TableHead>
                <TableHead className="font-medium py-3 text-rigth">
                  Course name
                </TableHead>
                <TableHead className="font-medium py-3 w-28 text-rigth">
                  Lesson
                </TableHead>
                <TableHead className="font-medium py-3 w-28 text-rigth">
                  Price
                </TableHead>
                <TableHead className="font-medium py-3 w-48 hidden md:table-cell text-rigth">
                  Created date
                </TableHead>
                <TableHead className="font-medium py-3 w-48 hidden lg:table-cell text-rigth">
                  Updated date
                </TableHead>
                <TableHead className="font-medium py-3 text-rigth w-28">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="p-10 text-center text-gray-800"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="p-10 text-center text-gray-800"
                  >
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c, index) => {
                  const price = `${c.currency} ${Number(
                    c.price ?? 0
                  ).toLocaleString()}`;
                  const lessonsCount = (c.modules ?? []).reduce(
                    (acc, m) => acc + (m.lessons?.length ?? 0),
                    0
                  );
                  const created = c.created_at
                    ? new Date(c.created_at).toLocaleString()
                    : "-";
                  const updated = (c as { updated_at?: string }).updated_at
                    ? new Date((c as { updated_at?: string }).updated_at!).toLocaleString()
                    : created;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="text-center text-b3">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={c.thumbnail}
                            alt={c.title}
                            width={80}
                            height={56}
                            className="h-14 w-20 object-cover rounded"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-b3 leading-5">
                          {c.title}
                        </div>
                        {/* Optionally, category or other metadata can go here */}
                      </TableCell>
                      <TableCell className="text-b3">
                        {lessonsCount} Lessons
                      </TableCell>
                      <TableCell className="text-b3">{price}</TableCell>
                      <TableCell className="text-b3 hidden md:table-cell">
                        {created}
                      </TableCell>
                      <TableCell className="text-b3 hidden lg:table-cell">
                        {updated}
                      </TableCell>
                      <TableCell className="text-rigth">
                        <div className="flex gap-2">
                          <DeleteModalAlert
                            delText="course"
                            onDelete={() => handleDelete(c.id)}
                            isDeleting={deletingId === c.id}
                          />
                          <Link
                            href={`/admin/courses/${c.id}/edit`}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-blue-300" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
