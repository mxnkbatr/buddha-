"use client";

import React from "react";
import { motion, MotionProps } from "framer-motion";
import { Sparkles } from "lucide-react";

type DivineButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & MotionProps & {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
    className?: string;
    icon?: React.ReactNode;
};

export default function DivineButton({
    children,
    variant = "primary",
    className = "",
    icon,
    ...props
}: DivineButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm
        overflow-hidden group transition-all duration-300
        ${className}
      `}
      {...props}
    >
      {/* BACKGROUND & SHADOWS */}
      <div 
        className={`absolute inset-0 transition-all duration-500
        ${isPrimary 
          ? "bg-gold shadow-gold" 
          : "bg-white border-2 border-gold/30 hover:border-gold shadow-card"
        }
      `}
      />

      {/* SHINE EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* CONTENT */}
      <div className={`relative z-10 flex items-center justify-center gap-3
          ${isPrimary ? "text-white" : "text-gold"}
        `}>
        {icon && <span className="group-hover:rotate-12 transition-transform">{icon}</span>}
        {children}
      </div>
    </motion.button>
  );
}
