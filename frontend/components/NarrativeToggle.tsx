"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { Droplet } from "lucide-react";
import { useNarrative } from "@/lib/narrative-context";
import { cn } from "@/lib/utils";

export function NarrativeToggle() {
  const { version, toggleVersion } = useNarrative();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      isIconOnly
      size="sm"
      onPress={() => toggleVersion()}
      className={cn(
        "transition-all duration-300",
        "hover:scale-110",
        version === "bst" ? "text-[#8B0000]" : "text-white"
      )}
      aria-label={`Switch to ${version === "bst" ? "SST" : "BST"} mode`}
    >
      <Droplet className={cn("w-5 h-5", version === "bst" ? "fill-[#8B0000]" : "fill-white")} />
    </Button>
  );
}
