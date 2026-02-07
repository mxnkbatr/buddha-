"use client";

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { hapticsMedium, hapticsLight } from '@/app/capacitor/plugins/haptics';
import { usePlatform } from '@/app/capacitor/hooks/usePlatform';

export interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** Button size - all meet minimum 48px touch target */
    size?: 'small' | 'medium' | 'large';
    /** Loading state */
    loading?: boolean;
    /** Icon to display before text */
    iconBefore?: ReactNode;
    /** Icon to display after text */
    iconAfter?: ReactNode;
    /** Haptic intensity */
    hapticIntensity?: 'none' | 'light' | 'medium';
}

/**
 * Touch-optimized button component for mobile apps.
 * 
 * Features:
 * - Minimum 48px touch target (iOS: 44pt, Android: 48dp)
 * - Haptic feedback on press
 * - Platform-specific press animations
 * - Loading states
 * - Accessible
 * 
 * @example
 * ```tsx
 * <MobileButton variant="primary" onClick={handleBook}>
 *   Book Session
 * </MobileButton>
 * ```
 */
export default function MobileButton({
    variant = 'primary',
    size = 'medium',
    loading = false,
    hapticIntensity = 'medium',
    iconBefore,
    iconAfter,
    children,
    className = '',
    onClick,
    disabled,
    ...props
}: MobileButtonProps) {
    const { isNative, isIOS, isAndroid } = usePlatform();

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;

        // Trigger haptic feedback on native platforms
        if (isNative) {
            if (hapticIntensity === 'light') {
                await hapticsLight();
            } else if (hapticIntensity === 'medium') {
                await hapticsMedium();
            }
        }

        onClick?.(e);
    };

    // Size classes - all meet minimum touch target
    const sizeClasses = {
        small: 'min-h-[48px] px-4 py-2 text-sm',
        medium: 'min-h-[52px] px-6 py-3 text-base',
        large: 'min-h-[56px] px-8 py-4 text-lg',
    };

    // Variant classes
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80 shadow-md',
        secondary: 'bg-surface-alt text-text-main hover:bg-surface-alt/90 active:bg-surface-alt/80 border border-border',
        ghost: 'bg-transparent text-text-main hover:bg-surface-alt/50 active:bg-surface-alt',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md',
    };

    // Platform-specific press animation
    const pressAnimation = isIOS
        ? 'active:scale-95 transition-transform duration-100'
        : 'active:scale-98 transition-all duration-75';

    // Ripple effect for Android
    const rippleEffect = isAndroid ? 'overflow-hidden relative' : '';

    return (
        <button
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${pressAnimation}
        ${rippleEffect}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        rounded-full font-semibold
        flex items-center justify-center gap-2
        transition-all
        select-none
        ${className}
      `}
            {...props}
        >
            {/* Android ripple effect */}
            {isAndroid && !disabled && !loading && (
                <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 bg-white/20 transform scale-0 group-active:scale-100 transition-transform duration-300 rounded-full" />
                </span>
            )}

            {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {iconBefore && <span className="flex-shrink-0">{iconBefore}</span>}
                    {children}
                    {iconAfter && <span className="flex-shrink-0">{iconAfter}</span>}
                </>
            )}
        </button>
    );
}
