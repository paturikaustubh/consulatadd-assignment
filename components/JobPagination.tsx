"use client";

import { Dispatch, SetStateAction } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobPaginationProps {
  currentPage: number;
  totalJobs: number;
  selectedPageSize: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setSelectedPageSize: Dispatch<SetStateAction<number>>;
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
  maxPagesToShow: number,
): (number | "...")[] {
  const items: (number | "...")[] = [];
  const half = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - half);
  let endPage = Math.min(totalPages, currentPage + half);

  if (endPage - startPage + 1 < maxPagesToShow) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
  }

  if (startPage > 1) {
    items.push(1);
    if (startPage > 2) {
      items.push("...");
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    items.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      items.push("...");
    }
    items.push(totalPages);
  }

  return items;
}

export default function JobPagination({
  currentPage,
  totalJobs,
  selectedPageSize,
  setCurrentPage,
  setSelectedPageSize,
}: JobPaginationProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem className="cursor-pointer">
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isActive={currentPage > 1}
            />
          </PaginationItem>
          {getPaginationItems(
            currentPage,
            Math.ceil(totalJobs / selectedPageSize),
            5,
          ).map((item, index) => {
            if (item === "...") {
              return (
                <PaginationItem className="cursor-default" key={index}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem className="cursor-pointer" key={index}>
                <PaginationLink
                  isActive={currentPage === item}
                  onClick={() => setCurrentPage(item as number)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem className="cursor-pointer">
            <PaginationNext
              onClick={() => setCurrentPage((prev) => prev + 1)}
              isActive={currentPage * selectedPageSize < totalJobs}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Select
        value={String(selectedPageSize)}
        onValueChange={(value) => {
          setSelectedPageSize(Number(value));
          setCurrentPage(1); // Reset to first page when page size changes
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select page size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 per page</SelectItem>
          <SelectItem value="15">15 per page</SelectItem>
          <SelectItem value="20">20 per page</SelectItem>
          <SelectItem value="25">25 per page</SelectItem>
          <SelectItem value="50">50 per page</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
