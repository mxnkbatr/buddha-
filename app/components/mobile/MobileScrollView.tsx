"use client";

import React, { ReactNode, useRef, useState, useCallback } from 'react';
import { usePlatform } from '@/app/capacitor/hooks/usePlatform';
import { hapticsLight } from '@/app/capacitor/plugins/haptics';

export interface MobileScrollViewProps {
    children: ReactNode;
    /** Enable pull-to-refresh */
    pullToRefresh?: boolean;
    /** Callback when pull-to-refresh is triggered */
    onRefresh?: () => Promise<void>;
    /** Custom className */
    className?: string;
    /** Scroll direction */
    direction?: 'vertical' | 'horizontal';
}

/**
 * Native-feeling scroll view with pull-to-refresh.
 * 
 * Features:
 * - Pull-to-refresh with haptic feedback
 * - iOS bounce effect
 * - Android overscroll
 * - Smooth scrolling
 * 
 * @example
 * ```tsx
 * <MobileScrollView 
 *   pullToRefresh 
 *   onRefresh={async () => {
 *     await fetchNewData();
 *   }}
 * >
 *   <MonkList />
 * </MobileScrollView>
 * ```
 */
export default function MobileScrollView({
    children,
    pullToRefresh = false,
    onRefresh,
    className = '',
    direction = 'vertical',
}: MobileScrollViewProps) {
    const { isNative, isIOS } = usePlatform();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef(0);
    const isPulling = useRef(false);

    const PULL_THRESHOLD = 80; // Distance to trigger refresh

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!pullToRefresh || !onRefresh) return;

        const scrollTop = scrollRef.current?.scrollTop || 0;
        if (scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    }, [pullToRefresh, onRefresh]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling.current || !pullToRefresh) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;

        if (diff > 0 && diff < PULL_THRESHOLD * 1.5) {
            setPullDistance(diff);

            // Haptic feedback at threshold
            if (diff > PULL_THRESHOLD && isNative) {
                hapticsLight();
            }
        }
    }, [pullToRefresh, isNative]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current || !pullToRefresh) return;

        isPulling.current = false;

        if (pullDistance > PULL_THRESHOLD && onRefresh && !isRefreshing) {
            setIsRefreshing(true);

            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
    }, [pullDistance, pullToRefresh, onRefresh, isRefreshing]);

    const refreshProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

    return (
        <div
            ref={scrollRef}
            className={`
        ${direction === 'vertical' ? 'overflow-y-auto' : 'overflow-x-auto'}
        ${direction === 'vertical' ? 'h-full' : 'w-full'}
        ${isIOS ? '-webkit-overflow-scrolling-touch' : ''}
        ${className}
      `}
            style={{
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull-to-refresh indicator */}
            {pullToRefresh && (
                <div
                    className="flex items-center justify-center transition-all duration-200 ease-out"
                    style={{
                        height: isRefreshing ? 60 : pullDistance,
                        opacity: isRefreshing || pullDistance > 20 ? 1 : 0,
                    }}
                >
                    <div className="flex flex-col items-center gap-2">
                        {isRefreshing ? (
                            <>
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-text-muted">Refreshing...</span>
                            </>
                        ) : (
                            <>
                                <div
                                    className="w-6 h-6 border-2 border-primary rounded-full transition-transform"
                                    style={{
                                        transform: `rotate(${refreshProgress * 360}deg)`,
                                        borderTopColor: 'transparent',
                                    }}
                                />
                                {pullDistance > PULL_THRESHOLD && (
                                    <span className="text-xs text-primary font-medium">Release to refresh</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div
                className="transition-transform duration-200"
                style={{
                    transform: `translateY(${isRefreshing ? 0 : 0}px)`,
                }}
            >
                {children}
            </div>
        </div>
    );
}
