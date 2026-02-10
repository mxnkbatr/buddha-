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
        overflow-hidden group
        ${className}
      `}
            {...props}
        >
            {/* BACKGROUND GRADIENT & SHADOWS */}
            <div
                className={`absolute inset-0 transition-all duration-500
        ${isPrimary
                        ? "bg-gradient-to-br from-[var(--color-divine-gold-light)] via-[var(--color-divine-gold)] to-[#D4AF37]"
                        : "bg-[var(--divine-cream)] border-2 border-[var(--color-divine-gold)]"
                    }
        shadow-[inset_0_-4px_6px_rgba(0,0,0,0.1),0_4px_10px_rgba(212,175,55,0.2)]
        group-hover:shadow-[0_0_30px_rgba(212,175,55,0.6),inset_0_-4px_6px_rgba(0,0,0,0.1)]
      `}
            />

            {/* SHINE EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* CONTENT */}
            <div className={`relative z-10 flex items-center justify-center gap-2
          ${isPrimary ? "text-white text-shadow-sm" : "text-[var(--color-divine-bronze)]"}
        `}>
                {icon || <Sparkles size={16} className={isPrimary ? "text-yellow-100" : "text-[var(--color-divine-gold)]"} />}
                {children}
            </div>
        </motion.button>
    );
}
