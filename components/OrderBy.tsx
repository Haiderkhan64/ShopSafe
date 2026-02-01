"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Button } from "./ui/button";

const sortOptions = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Best Selling", value: "popular" },
];

export function OrderBy() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "";
  
  const [selectedSort, setSelectedSort] = useState(
    sortOptions.find(opt => opt.value === currentSort) || undefined
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (option: typeof sortOptions[0]) => {
    setSelectedSort(option);
    setIsOpen(false);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", option.value);
    router.push(`?${params.toString()}`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"}>
          <div className="flex items-center gap-2 text-xs md:text-sm font-normal md:font-semibold text-gray-700">
            <span className="text-gray-600 group-hover:text-white transition-colors uppercase">
              {selectedSort?.label || "SORT BY"}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-400 group-hover:text-white transition-all duration-200",
                isOpen && "transform rotate-180"
              )}
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
        align="start"
      >
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "text-sm cursor-pointer rounded-md transition-colors px-3 py-2",
              "text-zinc-600 hover:text-black hover:bg-zinc-100",
              "focus:text-black focus:bg-zinc-100 focus:outline-none",
              selectedSort?.value === option.value &&
                "bg-zinc-100 text-black font-medium"
            )}
            onClick={() => handleSortChange(option)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}