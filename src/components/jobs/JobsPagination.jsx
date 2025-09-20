import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function JobsPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2
        );
      }
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* First page */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(1)}
        className="hidden sm:flex"
      >
        <ChevronsLeft className="w-4 h-4" />
      </Button>

      {/* Previous page */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            disabled={isLoading}
            onClick={() => onPageChange(page)}
            className={
              page === currentPage ? "gradient-primary text-white" : ""
            }
          >
            {page}
          </Button>
        ))}
      </div>

      {/* Next page */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Last page */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(totalPages)}
        className="hidden sm:flex"
      >
        <ChevronsRight className="w-4 h-4" />
      </Button>

      <div className="hidden sm:flex items-center text-sm text-muted-foreground ml-4">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
