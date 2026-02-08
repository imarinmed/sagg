'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  label: string;
  restricted?: boolean;
}

interface CharacterNavSidebarProps {
  sections: Section[];
  className?: string;
}

export function CharacterNavSidebar({ sections, className }: CharacterNavSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: 0.1,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <nav className={cn('sticky top-24 w-64 hidden lg:block', className)}>
      <div className="glass glass-catalog p-6 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--glass-bg)] backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-[var(--shadow-glow)]">
        <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-4 pl-3 border-l-2 border-transparent">
          Contents
        </h3>
        <ul className="space-y-1 relative">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <li key={section.id} className="relative">
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-between group relative z-10',
                    isActive
                      ? 'text-[var(--color-accent-primary)] font-medium'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                  )}
                >
                  <span className="truncate">{section.label}</span>
                  {section.restricted && (
                    <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 shadow-[0_0_10px_var(--color-error)_inset] opacity-80">
                      SST
                    </span>
                  )}
                </button>
                {isActive && (
                  <motion.div
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 bg-[var(--color-accent-primary)]/5 rounded-lg border-l-2 border-[var(--color-accent-primary)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
