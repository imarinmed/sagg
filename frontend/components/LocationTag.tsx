"use client";

import { MapPin, School, Castle, Dumbbell, PartyPopper, TreePine, Home, Car } from "lucide-react";

interface LocationTagProps {
  location: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const locationConfig: Record<
  string,
  {
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    label: string;
  }
> = {
  school: {
    icon: <School className="w-4 h-4" />,
    bgColor: "bg-blue-900/90",
    textColor: "text-blue-100",
    label: "School",
  },
  castle: {
    icon: <Castle className="w-4 h-4" />,
    bgColor: "bg-purple-900/90",
    textColor: "text-purple-100",
    label: "Castle",
  },
  gym: {
    icon: <Dumbbell className="w-4 h-4" />,
    bgColor: "bg-orange-900/90",
    textColor: "text-orange-100",
    label: "Gym",
  },
  party: {
    icon: <PartyPopper className="w-4 h-4" />,
    bgColor: "bg-pink-900/90",
    textColor: "text-pink-100",
    label: "Party",
  },
  outdoors: {
    icon: <TreePine className="w-4 h-4" />,
    bgColor: "bg-green-900/90",
    textColor: "text-green-100",
    label: "Outdoors",
  },
  home: {
    icon: <Home className="w-4 h-4" />,
    bgColor: "bg-amber-900/90",
    textColor: "text-amber-100",
    label: "Home",
  },
  car: {
    icon: <Car className="w-4 h-4" />,
    bgColor: "bg-slate-800/90",
    textColor: "text-slate-100",
    label: "Car",
  },
};

export function LocationTag({ location, size = "md", showIcon = true }: LocationTagProps) {
  const config = locationConfig[location.toLowerCase()] || {
    icon: <MapPin className="w-4 h-4" />,
    bgColor: "bg-gray-700/90",
    textColor: "text-gray-100",
    label: location,
  };

  const sizeClasses = size === "sm" ? "text-xs px-2 py-1 gap-1" : "text-sm px-3 py-1.5 gap-2";

  return (
    <div
      className={`
        inline-flex items-center ${sizeClasses}
        rounded-full
        font-[var(--font-inter)] font-medium
        ${config.bgColor} ${config.textColor}
      `}
      style={{
        border: `1px solid rgba(255, 255, 255, 0.3)`,
      }}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </div>
  );
}
