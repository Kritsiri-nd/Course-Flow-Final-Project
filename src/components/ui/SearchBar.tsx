"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  query, 
  setQuery, 
  placeholder = "Search...",
  className = ""
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-64 rounded-lg border border-gray-300 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
