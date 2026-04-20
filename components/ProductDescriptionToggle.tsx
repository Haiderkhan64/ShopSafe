"use client";

import { useState } from "react";
import { PortableText, type PortableTextBlock } from "next-sanity";

interface ProductDescriptionToggleProps {
  description: PortableTextBlock[];
  // productId: string;
}

export default function ProductDescriptionToggle({
  description,
  // productId,
}: ProductDescriptionToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!Array.isArray(description) || description.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No description available for this product.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Product Details
      </h2>

      <div className="relative">
        <div className="relative overflow-hidden">
          {/* Content with expand/collapse animation */}
          <div
            className={`prose prose-lg dark:prose-invert max-w-none leading-relaxed
              overflow-hidden transition-all duration-300
              ${isExpanded ? "max-h-[500px]" : "max-h-24"}`}
          >
            <PortableText value={description} />
          </div>

          {/* Gradient overlay - hidden when expanded */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t 
              from-white dark:from-slate-950 to-transparent pointer-events-none 
              transition-opacity duration-300 ${isExpanded ? "opacity-0" : "opacity-100"}`}
          />
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 inline-flex items-center gap-1 cursor-pointer text-sm font-medium
            text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300
            transition-colors duration-200 relative z-10 group"
        >
          {isExpanded ? (
            <>
              Show less
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </>
          ) : (
            <>
              Show more
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
