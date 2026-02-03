"use client";

import { useState, useEffect } from "react";
import { Button, Popover } from "@heroui/react";
import { Theme, THEMES, getStoredTheme, setTheme, getAvailableThemes } from "@/lib/theme";

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>("gothic");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get initial theme from localStorage
    const stored = getStoredTheme();
    setCurrentTheme(stored);
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
    setIsOpen(false);
  };

  const availableThemes = getAvailableThemes();

  // Get icon based on current theme
  const getThemeIcon = () => {
    switch (currentTheme) {
      case "gothic":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case "luxury":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
      case "nordic":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
    }
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Current theme: ${THEMES[currentTheme].name}. Click to change theme.`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105"
          style={{
            borderColor: "rgba(212, 175, 55, 0.4)",
            background: "rgba(20, 20, 20, 0.5)",
            color: "var(--color-accent-primary)",
          }}
        >
          {getThemeIcon()}
          <span className="hidden sm:inline text-sm font-medium tracking-wide">{THEMES[currentTheme].name}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Content placement="bottom end" className="w-64">
        <Popover.Dialog>
          <div className="space-y-1 p-2">
            <p className="text-xs font-medium text-[var(--color-text-muted)] px-2 py-1">
              Select Theme
            </p>
            {availableThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-md transition-colors
                  ${currentTheme === theme.id 
                    ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]' 
                    : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{theme.name}</span>
                  {currentTheme === theme.id && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${currentTheme === theme.id ? 'text-[var(--color-text-inverse)]/80' : 'text-[var(--color-text-muted)]'}`}>
                  {theme.description}
                </p>
              </button>
            ))}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
