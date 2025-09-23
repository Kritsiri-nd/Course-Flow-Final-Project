"use client";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminPanel } from "@/components/layouts/sidebar-admin-panel";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash } from "lucide-react";
import Link from "next/link";
import DeleteModalAlert from "@/components/ui/delete-modal-alert";

export default function Assignments() {
  const [assignments, setAssignments] = useState<[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  return (
    <SidebarProvider>
      <AdminPanel />
      <SidebarInset className="bg-gray-100">
        {/* header */}
        <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 sticky top-0 z-20">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-h3 font-semibold">Assignments</h1>

          {/* searchbar & add course button */}
          <div className="ml-auto gap-4 flex items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="h-12 w-64 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link href="/admin/assignments/create">
              <Button
                variant="outline"
                className="bg-blue-500 text-white h-15 rounded-lg px-8"
              >
                <Plus className="h-4 w-4" />
                Add Assignment
              </Button>
            </Link>
          </div>
        </header>

        {/* table */}
        <div className="rounded-lg border border-none overflow-x-auto bg-white m-10">
          <Table className="min-w-[960px]">
            <TableHeader>
              <TableRow className="bg-gray-300 border-none">
                <TableHead className="font-medium py-3 w-36 text-rigth">
                  Assignment detail
                </TableHead>
                <TableHead className="font-medium py-3 w-36 text-rigth">
                  Course
                </TableHead>
                <TableHead className="font-medium py-3 w-36 text-rigth">
                  Lesson
                </TableHead>
                <TableHead className="font-medium py-3 w-36 text-rigth">
                  Sub-lesson
                </TableHead>
                <TableHead className="font-medium py-3 w-36 text-rigth">
                  Created date
                </TableHead>
                <TableHead className="font-medium py-3 w-28 text-rigth">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell className="text-rigth text-b3">test1</TableCell>
                <TableCell className="text-rigth text-b3">test2</TableCell>
                <TableCell className="text-rigth text-b3">test3</TableCell>
                <TableCell className="text-rigth text-b3">test4</TableCell>
                <TableCell className="text-rigth text-b3">test5</TableCell>
                <TableCell className="text-rigth">
                  <div className="flex gap-2">
                    <DeleteModalAlert />
                    <Link
                      href="/admin/assignments/edit"
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-blue-300" />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
