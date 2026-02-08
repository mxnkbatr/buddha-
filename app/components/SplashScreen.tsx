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
        }, 800)  // Reduced from 1200ms for faster perceived load

        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.8, ease: 'easeInOut' }
                    }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                >
                    <div className="relative flex flex-col items-center">
                        {/* Logo container with subtle glow */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                transition: {
                                    duration: 1.2,
                                    ease: [0.22, 1, 0.36, 1]
                                }
                            }}
                            className="relative w-32 h-32 md:w-40 md:h-40 mb-8"
                        >
                            <div className="absolute inset-x-0 inset-y-0 bg-orange-100/50 rounded-full scale-110" />
                            <div className="relative w-full h-full">
                                <Image
                                    src="/logo.png"
                                    alt="Gevabal Logo"
                                    fill
                                    sizes="(max-width: 768px) 110px, 140px"
                                    className="object-contain"
                                    priority
                                    loading="eager"
                                />
                            </div>
                        </motion.div>

                        {/* Title with elegant fade-in */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{
                                y: 0,
                                opacity: 1,
                                transition: {
                                    delay: 0.5,
                                    duration: 0.8,
                                    ease: 'easeOut'
                                }
                            }}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 tracking-wider mb-2">
                                GEVABAL
                            </h1>
                            <div className="h-px w-16 bg-orange-400 mx-auto my-3" />
                            <p className="text-sm md:text-base font-lato text-gray-500 tracking-[0.2em] uppercase">
                                Spiritual Guidance
                            </p>
                        </motion.div>
                    </div>

                    {/* Minimalist loading indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="absolute bottom-12 flex space-x-2"
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                                className="w-1.5 h-1.5 bg-orange-300 rounded-full"
                            />
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
