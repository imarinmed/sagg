"use client";

import React from "react";

interface TabooTagProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function TabooTag({ 
  children, 
  className, 
  onClick, 
  removable = false,
  onRemove 
}: TabooTagProps) {
  return (
    <span 
      className={`
        taboo-tag
        inline-flex items-center gap-1 px-3 py-1.5 rounded-full
        text-sm font-medium font-[var(--font-inter)]
        transition-all duration-300 ease-out
        cursor-pointer select-none
        ${className || ''}
      `}
      onClick={onClick}
    >
      {children}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="taboo-tag-remove ml-1 hover:opacity-80 transition-opacity"
          aria-label="Remove tag"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 14 14" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="taboo-tag-icon"
          >
            <path 
              d="M4 4L10 10M10 4L4 10" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
