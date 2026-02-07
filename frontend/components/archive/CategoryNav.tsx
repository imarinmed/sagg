import React from 'react';
import { Link } from "@heroui/react";

interface Category {
  id: string;
  label: string;
  count?: number;
  href: string;
}

interface CategoryNavProps {
  categories: Category[];
  activeCategoryId?: string;
  className?: string;
}

export const CategoryNav = ({
  categories,
  activeCategoryId,
  className = '',
}: CategoryNavProps) => {
  return (
    <nav className={`flex flex-col space-y-1 ${className}`} aria-label="Category navigation">
      {categories.map((category) => {
        const isActive = activeCategoryId === category.id;
        return (
          <Link
            key={category.id}
            href={category.href}
            className={`
              group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all duration-200
              ${isActive 
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-section-accent)] font-medium' 
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{category.label}</span>
            {category.count !== undefined && (
              <span className={`
                text-xs font-mono
                ${isActive 
                  ? 'text-[var(--color-section-accent)] opacity-100' 
                  : 'text-[var(--color-text-muted)] opacity-60 group-hover:opacity-100'
                }
              `}>
                {category.count.toString().padStart(2, '0')}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
