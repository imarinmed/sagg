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
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
      <nav
        className="relative mx-auto max-w-7xl transition-all duration-500 rounded-2xl overflow-hidden"
        style={{
          background: scrolled
            ? "rgba(12, 12, 14, 0.75)"
            : "rgba(12, 12, 14, 0.5)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(212, 175, 55, 0.15)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
            : "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        }}
      >
        {/* Inner Glow Border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(212, 175, 55, 0.08)",
          }}
        />

        <div className="relative flex items-center justify-between h-16 px-6">
          {/* Left Side - BST Logo */}
          <Link
            href="/"
            className="group relative flex items-center gap-2 shrink-0"
          >
            {/* Glow Effect */}
            <div
              className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)",
              }}
            />

            {/* Blood Drop Icon */}
            <svg
              className="relative w-6 h-6 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(139,0,0,0.8)]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C12 2 6 8 6 13C6 16.3137 8.68629 19 12 19C15.3137 19 18 16.3137 18 13C18 8 12 2 12 2Z"
                fill="url(#bloodGradientNav)"
                stroke="rgba(139, 0, 0, 0.8)"
                strokeWidth="1"
              />
              <defs>
                <linearGradient
                  id="bloodGradientNav"
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

            {/* BST Text */}
            <span
              className="font-heading text-lg tracking-[0.15em] uppercase transition-all duration-300"
              style={{
                color: "var(--color-text-primary)",
              }}
            >
              BST
            </span>
          </Link>

          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center justify-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2"
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Hover Background */}
                <div
                  className="absolute inset-0 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139, 0, 0, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.15)",
                  }}
                />

                {/* Text */}
                <span
                  className="relative font-heading text-sm tracking-[0.12em] uppercase transition-all duration-300"
                  style={{
                    color:
                      hoveredItem === item.href
                        ? "var(--color-accent-primary)"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {item.label}
                </span>

                {/* Underline */}
                <div
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px transition-all duration-300"
                  style={{
                    width: hoveredItem === item.href ? "50%" : "0%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent)",
                  }}
                />
              </Link>
            ))}
          </div>

          {/* Right Side - BSS Logo + Theme Toggle */}
          <div className="flex items-center gap-4 shrink-0">
            {/* BSS Text */}
            <Link
              href="/"
              className="group relative flex items-center gap-2"
            >
              {/* Glow Effect */}
              <div
                className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(139, 0, 0, 0.25) 0%, transparent 70%)",
                }}
              />

              {/* BSS Text */}
              <span
                className="relative font-heading text-lg tracking-[0.15em] uppercase transition-all duration-300"
                style={{
                  color: "var(--color-accent-primary)",
                }}
              >
                BSS
              </span>

              {/* Secondary Blood Drop */}
              <svg
                className="relative w-5 h-5 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(139,0,0,0.8)]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C12 2 6 8 6 13C6 16.3137 8.68629 19 12 19C15.3137 19 18 16.3137 18 13C18 8 12 2 12 2Z"
                  fill="url(#bloodGradientNav2)"
                  stroke="rgba(139, 0, 0, 0.8)"
                  strokeWidth="1"
                />
                <defs>
                  <linearGradient
                    id="bloodGradientNav2"
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
            </Link>

            {/* Divider */}
            <div
              className="w-px h-6"
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
                    "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)",
                }}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
