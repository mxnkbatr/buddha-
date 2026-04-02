"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DivineBackground() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // Rotating 'God Rays'
    const rays = Array.from({ length: 12 });

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-cream">
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('/noise.svg')]" />
            
            {/* Soft Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(217,119,6,0.08)_0%,_transparent_70%)]" />

            {/* Rotating Spirit Mandala */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-50%] left-[-50%] w-[200vw] h-[200vw] opacity-[0.03]"
            >
                {rays.map((_, i) => (
                    <div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-[60vw] h-[1.5px] origin-left bg-gold/15"
                        style={{ 
                            transform: `rotate(${i * 30}deg)`,
                            filter: 'blur(1px)'
                        }}
                    />
                ))}
            </motion.div>

            {/* Floating Sacral Dust */}
            {mounted && Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * 100 + "vw",
                        y: Math.random() * 100 + "vh",
                        scale: Math.random() * 0.4 + 0.2,
                        opacity: 0
                    }}
                    animate={{
                        y: [null, Math.random() * -100 + "vh"],
                        opacity: [0, 0.3, 0],
                        scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: Math.random() * 20 + 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute rounded-full blur-[2px] bg-gold/40 w-2 h-2"
                />
            ))}

            {/* Subtle Depth Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
        </div>
    );
}
