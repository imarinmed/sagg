"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/episodes", label: "Episodes" },
  { href: "/characters", label: "Characters" },
  { href: "/mythos", label: "Mythos" },
  { href: "/graph", label: "Graph" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(8, 8, 8, 0.85)"
          : "linear-gradient(to bottom, rgba(8, 8, 8, 0.6) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(212, 175, 55, 0.2)"
          : "1px solid transparent",
        boxShadow: scrolled
          ? "0 4px 30px rgba(0, 0, 0, 0.4), 0 0 60px rgba(139, 0, 0, 0.1)"
          : "none",
      }}
    >
      {/* Ambient Glow Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500"
        style={{
          background: scrolled
            ? "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.5) 50%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.2) 50%, transparent 100%)",
          opacity: scrolled ? 1 : 0.5,
        }}
      />

      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link
            href="/"
            className="group relative flex items-center gap-3"
          >
            {/* Logo Glow Effect */}
            <div
              className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)",
              }}
            />

            {/* Blood Drop Icon */}
            <svg
              className="relative w-8 h-8 transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(139,0,0,0.8)]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C12 2 6 8 6 13C6 16.3137 8.68629 19 12 19C15.3137 19 18 16.3137 18 13C18 8 12 2 12 2Z"
                fill="url(#bloodGradient)"
                stroke="rgba(139, 0, 0, 0.8)"
                strokeWidth="1"
              />
              <defs>
                <linearGradient
                  id="bloodGradient"
                  x1="6"
                  y1="2"
                  x2="18"
                  y2="19"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#8B0000" />
                  <stop offset="1" stopColor="#4A0404" />
                </linearGradient>
              </defs>
            </svg>

            {/* Title */}
            <div className="relative">
              <span
                className="font-heading text-xl md:text-2xl tracking-[0.2em] uppercase transition-all duration-300"
                style={{
                  color: "var(--color-text-primary)",
                  textShadow: scrolled
                    ? "0 0 20px rgba(212, 175, 55, 0.3)"
                    : "none",
                }}
              >
                Blod
              </span>
              <span
                className="font-heading text-xl md:text-2xl tracking-[0.2em] uppercase transition-all duration-300"
                style={{
                  color: "var(--color-accent-primary)",
                }}
              >
                , Svett, Tårar
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-5 py-2"
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Hover Background */}
                <div
                  className="absolute inset-0 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139, 0, 0, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                />

                {/* Text */}
                <span
                  className="relative font-heading text-sm tracking-[0.15em] uppercase transition-all duration-300"
                  style={{
                    color:
                      hoveredItem === item.href
                        ? "var(--color-accent-primary)"
                        : "var(--color-text-secondary)",
                    textShadow:
                      hoveredItem === item.href
                        ? "0 0 10px rgba(212, 175, 55, 0.5)"
                        : "none",
                  }}
                >
                  {item.label}
                </span>

                {/* Underline Effect */}
                <div
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px transition-all duration-300"
                  style={{
                    width: hoveredItem === item.href ? "60%" : "0%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.8), transparent)",
                  }}
                />
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Decorative Separator */}
            <div
              className="hidden md:block w-px h-8"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(212, 175, 55, 0.3), transparent)",
              }}
            />

            {/* Theme Toggle */}
            <div className="relative">
              <div
                className="absolute -inset-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 blur-md"
                style={{
                  background:
                    "radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)",
                }}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
