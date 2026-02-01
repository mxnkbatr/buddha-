"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const CldVideoPlayer = dynamic(() => import("next-cloudinary").then(mod => mod.CldVideoPlayer), {
    ssr: false,
    loading: () => <div className="bg-black/10 animate-pulse w-full h-full" />
});

interface OptimizedVideoProps {
    src: string;
    className?: string;
    poster?: string;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    playsInline?: boolean;
    width?: number;
    height?: number;
    id?: string;
    useNative?: boolean;
    isLCP?: boolean;
}

const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
    src,
    className,
    poster,
    autoPlay = true,
    loop = true,
    muted = true,
    playsInline = true,
    width = 1080,
    height = 607,
    id,
    useNative = false,
    isLCP = false,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const isCloudinary = src.includes("cloudinary.com");

    const getPublicId = (url: string) => {
        if (!url.includes("cloudinary.com")) return url;
        const parts = url.split("/upload/");
        if (parts.length < 2) return url;
        // Extract public ID by removing version (vXXXX/) and extension
        return parts[1].replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
    };

    const publicId = getPublicId(src);

    // Optimize: Render immediately for native video to support SSR/LCP
    // Only wait for mount if using the CldVideoPlayer which requires client-side JS
    if (!mounted && !useNative) return <div className={className} style={{ width, height, backgroundColor: '#000' }} />;

    if (!isCloudinary || useNative) {
        // For Cloudinary URLs in native mode, we can still use Cloudinary transformations
        let finalSrc = src;
        let finalPoster = poster;

        if (isCloudinary && useNative) {
            const cloudName = src.split("res.cloudinary.com/")[1]?.split("/")[0];
            const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`;

            // Construct responsive sources
            const mobileSrc = `${baseUrl}/q_auto,f_auto,w_640/${publicId}.mp4`;
            const desktopSrc = `${baseUrl}/q_auto,f_auto/${publicId}.mp4`;

            if (!finalPoster) {
                // Optimize poster with Cloudinary transformations
                // Use smaller dimensions for non-LCP or mobile if needed, but here we use width/height
                finalPoster = `${baseUrl}/q_auto,f_auto,c_limit,w_${width},h_${height},so_0/${publicId}.jpg`;
            }

            return (
                <video
                    id={id}
                    className={className}
                    autoPlay={autoPlay}
                    loop={loop}
                    muted={muted}
                    playsInline={playsInline}
                    poster={finalPoster}
                    width={width}
                    height={height}
                    style={{ objectFit: 'cover' }}
                    // @ts-ignore
                    fetchPriority={isLCP ? "high" : "auto"}
                    // preload="none" for non-critical, but since it's usually background autoplay, auto or metadata is preferred
                    preload={isLCP ? "auto" : "metadata"}
                >
                    <source src={mobileSrc} media="(max-width: 768px)" type="video/mp4" />
                    <source src={desktopSrc} type="video/mp4" />
                    <track kind="captions" />
                </video>
            );
        }

        return (
            <video
                id={id}
                src={finalSrc}
                className={className}
                autoPlay={autoPlay}
                loop={loop}
                muted={muted}
                playsInline={playsInline}
                poster={finalPoster}
                width={width}
                height={height}
                style={{ objectFit: 'cover' }}
                // @ts-ignore
                fetchpriority={isLCP ? "high" : "auto"}
                // preload="none" for non-critical, but since it's usually background autoplay, auto or metadata is preferred
                preload={isLCP ? "auto" : "metadata"}
            >
                <track kind="captions" />
            </video>
        );
    }

    // Extract the cloud name from the URL if it's there, otherwise it will use the env default
    const cloudName = src.split("res.cloudinary.com/")[1]?.split("/")[0];

    return (
        <CldVideoPlayer
            key={src} // Force re-render on src change
            id={id || `video-${publicId.replace(/[^a-zA-Z0-9-]/g, '-')}`}
            width={width}
            height={height}
            src={publicId}
            sourceTypes={['mp4']}
            autoplay={autoPlay}
            loop={loop}
            muted={muted}
            playsinline={playsInline}
            controls={!autoPlay}
            className={className}
            config={{
                cloud: {
                    cloudName: cloudName || "dxoxdiuwr"
                }
            }}
            transformation={{
                width: width,
                height: height,
                crop: 'fill',
                gravity: 'center',
                quality: 'auto',
                fetch_format: 'auto'
            }}
        />
    );
};

export default React.memo(OptimizedVideo);
