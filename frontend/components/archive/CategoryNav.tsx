import React from 'react';
import { Link } from "@heroui/react";
import { 
  Dna, 
  Sparkles, 
  Users, 
  BookOpen, 
  Brain,
  Scroll,
  Layers
} from 'lucide-react';

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

const categoryIcons: Record<string, React.ReactNode> = {
  biology: <Dna className="w-4 h-4" />,
  supernatural: <Sparkles className="w-4 h-4" />,
  society: <Users className="w-4 h-4" />,
  psychology: <Brain className="w-4 h-4" />,
  rules: <Scroll className="w-4 h-4" />,
  all: <Layers className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  biology: 'text-emerald-400',
  supernatural: 'text-purple-400',
  society: 'text-amber-400',
  psychology: 'text-blue-400',
  rules: 'text-rose-400',
  all: 'text-white',
};

export const CategoryNav = ({
  categories,
  activeCategoryId,
  className = '',
}: CategoryNavProps) => {
  // Separate "all" category from others
  const allCategory = categories.find(c => c.id === 'all');
  const otherCategories = categories.filter(c => c.id !== 'all');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Female Protagonists Quick Links */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3 font-medium" style={{fontFamily: 'var(--font-geist-mono)'}}>
          Female Protagonists
        </h3>
        <nav className="flex flex-col space-y-0.5" aria-label="Character quick links">
          {[
            { id: 'kiara', name: 'Kiara', role: 'The Heart' },
            { id: 'desiree', name: 'Desirée', role: 'The Matriarch' },
            { id: 'celina', name: 'Celina', role: 'The Outsider' },
            { id: 'nora', name: 'Nora', role: 'The Rebel' },
          ].map((char) => (
            <Link
              key={char.id}
              href={`/characters/${char.id}`}
              className="group flex items-center justify-between py-1.5 text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              <span className="font-medium">{char.name}</span>
              <span className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors" style={{fontFamily: 'var(--font-geist-mono)'}}>
                {char.role}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Categories */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3 font-medium" style={{fontFamily: 'var(--font-geist-mono)'}}>
          Categories
        </h3>
        <nav className="flex flex-col" aria-label="Category navigation">
          {allCategory && (
            <Link
              key={allCategory.id}
              href={allCategory.href}
              className={`
                group flex items-center gap-3 py-2.5 text-sm transition-all duration-200 border-l-2
                ${activeCategoryId === allCategory.id
                  ? 'border-amber-500 bg-amber-500/5 text-white pl-3 -ml-[2px]' 
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/5 pl-3 -ml-[2px]'
                }
              `}
              aria-current={activeCategoryId === allCategory.id ? 'page' : undefined}
            >
              <span className={activeCategoryId === allCategory.id ? 'text-amber-400' : 'text-white/40 group-hover:text-white/60'}>
                {categoryIcons[allCategory.id] || <Layers className="w-4 h-4" />}
              </span>
              <span className="flex-1 font-medium">{allCategory.label}</span>
              {allCategory.count !== undefined && (
                <span className={`
                  text-[10px] font-mono tabular-nums
                  ${activeCategoryId === allCategory.id 
                    ? 'text-amber-400' 
                    : 'text-white/30'
                  }
                `}>
                  {allCategory.count}
                </span>
              )}
            </Link>
          )}

          <div className="h-px bg-white/5 my-1" />

          {otherCategories.map((category) => {
            const isActive = activeCategoryId === category.id;
            const icon = categoryIcons[category.id];
            const colorClass = categoryColors[category.id] || 'text-white';
            
            return (
              <Link
                key={category.id}
                href={category.href}
                className={`
                  group flex items-center gap-3 py-2 text-sm transition-all duration-200 border-l-2
                  ${isActive 
                    ? `border-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent text-white pl-3 -ml-[2px]` 
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.02] pl-3 -ml-[2px]'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={isActive ? colorClass : 'text-white/30 group-hover:text-white/50'}>
                  {icon}
                </span>
                <span className="flex-1">{category.label}</span>
                {category.count !== undefined && (
                  <span className={`
                    text-[10px] font-mono tabular-nums
                    ${isActive 
                      ? 'text-white/70' 
                      : 'text-white/20 group-hover:text-white/40'
                    }
                  `}>
                    {category.count.toString().padStart(2, '0')}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
