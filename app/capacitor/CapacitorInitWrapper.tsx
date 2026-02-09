"use client";

import dynamic from 'next/dynamic';

// Dynamically import CapacitorInit with ssr: false since it accesses native APIs
const CapacitorInitComponent = dynamic(
    () => import('./CapacitorInit'),
    { ssr: false }
);

/**
 * Client-side wrapper for CapacitorInit.
 * This allows us to use ssr: false in a client component context.
 */
export default function CapacitorInitWrapper() {
    return <CapacitorInitComponent />;
}
