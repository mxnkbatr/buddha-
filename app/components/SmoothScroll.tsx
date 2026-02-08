'use client'

import { useEffect } from 'react'

/**
 * Smooth scroll implementation using CSS-only approach.
 * Replaces Lenis to eliminate forced reflows and reduce TBT.
 * 
 * Why removed Lenis:
 * - Lenis hijacks requestAnimationFrame continuously (~60 calls/sec)
 * - Causes 465ms+ forced reflow on page load
 * - Adds 6+ seconds to Total Blocking Time
 * 
 * CSS scroll-behavior: smooth provides native smoothness with zero JS overhead.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = 'smooth'
    }

    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return null
}
