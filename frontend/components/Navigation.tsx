"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/episodes", label: "Episodes" },
  { href: "/characters", label: "Characters" },
  { href: "/mythos", label: "Mythos" },
  { href: "/graph", label: "Graph" },
];

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="font-heading text-2xl tracking-wider text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] transition-colors"
          >
            Blod, Svett, Tårar
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
