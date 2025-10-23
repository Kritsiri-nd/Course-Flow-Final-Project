"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/ui/SearchBar";

interface AdminHeaderProps {
  title: string;
  query: string;
  setQuery: (query: string) => void;
  placeholder: string;
  addButtonText: string;
  addButtonHref: string;
}

export default function AdminHeader({
  title,
  query,
  setQuery,
  placeholder,
  addButtonText,
  addButtonHref,
}: AdminHeaderProps) {
  return (
    <header className="flex h-23 shrink-0 items-center gap-2 bg-white border-b border-gray-300 px-4 pr-12 sticky top-0 z-20">
      <h1 className="text-h3 font-semibold ml-7">{title}</h1>

      {/* searchbar & add button */}
      <div className="ml-auto gap-4 flex items-center">
        <SearchBar
          query={query}
          setQuery={setQuery}
          placeholder={placeholder}
        />
        <Link href={addButtonHref}>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-15 rounded-lg !px-6 cursor-pointer">
            <Plus className="h-4 w-4" />
            {addButtonText}
          </Button>
        </Link>
      </div>
    </header>
  );
}
