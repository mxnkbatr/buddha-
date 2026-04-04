'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const hasShown = sessionStorage.getItem('splashShown')
        if (hasShown) {
            setIsVisible(false)
            return
        }

        setIsVisible(true)
        const timer = setTimeout(() => {
            setIsVisible(false)
            sessionStorage.setItem('splashShown', 'true')
        }, 800)

        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                    }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-hero-bg overflow-hidden"
                >
                    {/* Texture Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('/noise.svg')]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.1)_0%,_transparent_70%)]" />

                    <div className="relative flex flex-col items-center z-10">
                        {/* Logo container */}
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                transition: {
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1]
                                }
                            }}
                            className="relative w-40 h-40 md:w-48 md:h-48 mb-12"
                        >
                            <div className="relative w-full h-full flex items-center justify-center p-6 bg-white/5 backdrop-blur-sm rounded-full border border-white/5 shadow-modal">
                                <Image
                                    src="/logo.png"
                                    alt="Gevabal Logo"
                                    width={160}
                                    height={160}
                                    className="object-contain brightness-110 contrast-125"
                                    priority
                                    loading="eager"
                                />
                            </div>
                        </motion.div>

                        {/* Title with Traditional Mongolian Elegance */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{
                                y: 0,
                                opacity: 1,
                                transition: {
                                    delay: 0.4,
                                    duration: 1.2,
                                    ease: [0.22, 1, 0.36, 1]
                                }
                            }}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-white tracking-[0.4em] mb-4 uppercase">
                                GEVABAL
                            </h1>
                            <div className="h-[1.5px] w-16 bg-gold mx-auto mb-6 opacity-30 shadow-gold" />
                            <p className="text-[10px] md:text-xs font-sans text-gold/40 tracking-[0.6em] uppercase font-bold">
                                SANCTUARY OF WISDOM
                            </p>
                        </motion.div>
                    </div>

                    {/* Minimalist Sacral Pulse Loading */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className="absolute bottom-20 flex space-x-4"
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.1, 0.6, 0.1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeInOut"
                                }}
                                className="w-1.5 h-1.5 bg-gold rounded-full"
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
