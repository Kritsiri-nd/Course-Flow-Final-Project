"use client";
import { useState, useEffect } from "react";

//type for pagination
interface PaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
  onPageChange?: (
    paginatedData: T[],
    currentPage: number,
    totalPages: number
  ) => void;
  className?: string;
}

//pagination component
export default function PaginationUI<T>({
  data,
  itemsPerPage = 10,
  onPageChange,
  className = "",
}: PaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination values
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Call onPageChange callback when pagination changes
  useEffect(() => {
    if (onPageChange) {
      onPageChange(paginatedData, currentPage, totalPages);
    }
  }, [currentPage, data, itemsPerPage, onPageChange]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Don't render pagination if there's only one page or no data
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Show first 3 pages + ellipsis + last page
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 3 pages
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        // Show first + ellipsis + current-1, current, current+1 + ellipsis + last
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <div className={`flex justify-center items-center gap-2 mt-8 ${className}`}>
      {/* Previous Button */}
      <button
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              page === currentPage
                ? "text-white bg-blue-600 border border-blue-600"
                : page === "..."
                ? "text-gray-500 cursor-default"
                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
            }`}
            onClick={() => typeof page === "number" && handlePageClick(page)}
            disabled={page === "..."}
            aria-label={
              typeof page === "number" ? `Go to page ${page}` : undefined
            }
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
      </button>

      {/* Page Info */}
      <div className="ml-4 text-sm text-gray-700">
        Showing {startIndex + 1} to{" "}
        {Math.min(startIndex + itemsPerPage, data.length)} of {data.length}{" "}
        results
      </div>
    </div>
  );
}
