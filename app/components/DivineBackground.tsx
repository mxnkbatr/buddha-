"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DivineBackground() {
    // Rotating 'God Rays'
    const rays = Array.from({ length: 12 });

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--color-divine-cream)]">
            {/* Soft Ambient Glow - Replaces Dark Mode */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-divine-gold-light)]/20 via-transparent to-[var(--color-divine-white)]/40" />

            {/* Rotating Sun/Moon Mandala */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-50%] left-[-50%] w-[200vw] h-[200vw] opacity-[0.03]"
            >
                {rays.map((_, i) => (
                    <div
                        key={i}
                        className={`absolute top-1/2 left-1/2 w-[50vw] h-[2px] origin-left bg-[var(--color-divine-gold)]/10`}
                        style={{ transform: `rotate(${i * 30}deg)` }}
                    />
                ))}
            </motion.div>

            {/* Floating Particles (Dust/Stars) */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * 100 + "vw",
                        y: Math.random() * 100 + "vh",
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.5
                    }}
                    animate={{
                        y: [null, Math.random() * -100 + "vh"],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute rounded-full blur-[1px] bg-[var(--color-divine-gold)] w-2 h-2"
                />
            ))}

            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-[var(--color-divine-gold-light)]/20 to-transparent" />
        </div>
    );
}
