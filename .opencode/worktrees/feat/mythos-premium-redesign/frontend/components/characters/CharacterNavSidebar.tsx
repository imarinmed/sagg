"use client";

import { useState, useEffect } from "react";

interface NavSection {
  id: string;
  label: string;
  restricted?: boolean;
}

interface CharacterNavSidebarProps {
  sections: NavSection[];
}

export default function CharacterNavSidebar({ sections }: CharacterNavSidebarProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");

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
        rootMargin: "-20% 0px -80% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="glass rounded-lg p-4 space-y-2">
      <div className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
        Contents
      </div>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all duration-200 flex items-center justify-between ${
            activeSection === section.id
              ? "bg-[var(--color-accent-primary)] text-black font-medium"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <span>{section.label}</span>
          {section.restricted && (
            <span className="text-[10px] bg-red-900 text-white px-1.5 py-0.5 rounded">
              SST
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
