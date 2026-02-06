"use client";

import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ForgeButtonProps {
  onClick: () => void;
  className?: string;
}

export function ForgeButton({ onClick, className = "" }: ForgeButtonProps) {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={className}
        >
          <Button
            onPress={onClick}
            className="bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 hover:bg-black/60 hover:border-[#D4AF37]/60 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)] group transition-all duration-300"
            variant="ghost"
          >
            <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            <span className="font-heading tracking-wider">FORGE</span>
          </Button>
        </motion.div>
      </Tooltip.Trigger>
      <Tooltip.Content>
        Open Creative Companion
      </Tooltip.Content>
    </Tooltip>
  );
}

export default ForgeButton;
