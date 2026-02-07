"use client";

import { useState } from 'react';
import { useAccessibility } from '@/app/contexts/AccessibilityContext';
import { Settings, Type, Eye, Gauge, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccessibilityPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        elderMode,
        toggleElderMode,
        fontSize,
        setFontSize,
        highContrast,
        toggleHighContrast,
        reduceMotion,
        toggleReduceMotion,
    } = useAccessibility();

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-40 flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
                aria-label="Open accessibility settings"
            >
                <Settings size={24} />
                <span className="font-bold text-lg hidden md:inline">Accessibility</span>
            </button>

            {/* Settings Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-2xl z-50 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b-4 border-gray-200 p-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Settings size={28} />
                                    Accessibility
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-8">
                                {/* Elder Mode */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Eye size={24} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Elder Mode</h3>
                                            <p className="text-sm text-gray-600">Optimized for seniors</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={toggleElderMode}
                                        className={`w-full p-6 rounded-2xl border-4 font-bold text-lg transition-all ${elderMode
                                                ? 'bg-blue-600 text-white border-blue-700'
                                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-blue-300'
                                            }`}
                                    >
                                        {elderMode ? '✓ Elder Mode ON' : 'Elder Mode OFF'}
                                    </button>

                                    {elderMode && (
                                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                            <p className="text-sm font-semibold text-blue-900">
                                                ✓ Large text enabled<br />
                                                ✓ High contrast colors<br />
                                                ✓ Simplified interface<br />
                                                ✓ Large touch targets
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t-2 border-gray-200" />

                                {/* Font Size */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Type size={24} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Text Size</h3>
                                            <p className="text-sm text-gray-600">Adjust reading comfort</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {(['normal', 'large', 'xlarge'] as const).map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setFontSize(size)}
                                                className={`p-4 rounded-xl border-3 font-bold transition-all ${fontSize === size
                                                        ? 'bg-purple-600 text-white border-purple-700'
                                                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-purple-300'
                                                    }`}
                                            >
                                                <span className={size === 'xlarge' ? 'text-2xl' : size === 'large' ? 'text-xl' : 'text-base'}>
                                                    A
                                                </span>
                                                <div className="text-xs mt-1 capitalize">{size}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t-2 border-gray-200" />

                                {/* High Contrast */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                            <Eye size={24} className="text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">High Contrast</h3>
                                            <p className="text-sm text-gray-600">Better visibility</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={toggleHighContrast}
                                        className={`w-full p-6 rounded-2xl border-4 font-bold text-lg transition-all ${highContrast
                                                ? 'bg-yellow-600 text-white border-yellow-700'
                                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-yellow-300'
                                            }`}
                                    >
                                        {highContrast ? '✓ High Contrast ON' : 'High Contrast OFF'}
                                    </button>
                                </div>

                                <div className="border-t-2 border-gray-200" />

                                {/* Reduce Motion */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                            <Gauge size={24} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Reduce Motion</h3>
                                            <p className="text-sm text-gray-600">Minimal animations</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={toggleReduceMotion}
                                        className={`w-full p-6 rounded-2xl border-4 font-bold text-lg transition-all ${reduceMotion
                                                ? 'bg-green-600 text-white border-green-700'
                                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-green-300'
                                            }`}
                                    >
                                        {reduceMotion ? '✓ Reduced Motion ON' : 'Reduced Motion OFF'}
                                    </button>
                                </div>

                                {/* Help Text */}
                                <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                                    <p className="text-base font-semibold text-gray-700 mb-2">
                                        💡 Tip for Caregivers:
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Enable <strong>Elder Mode</strong> for a simplified experience with larger text and buttons.
                                        Your preferences are saved automatically.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
