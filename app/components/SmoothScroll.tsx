'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'

export default function SmoothScroll() {
  useEffect(() => {
    // 1. Detect if we are on a mobile/touch device
    //    'ontouchstart' in window checks for touch capability
    //    navigator.maxTouchPoints > 0 checks for touch points
    //    window.innerWidth < 768 is a fallback for small screens
    const isMobile =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);

    if (isMobile) {
      return; // Return early, do not initialize Lenis
    }

    const lenis = new Lenis()

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return null
}
