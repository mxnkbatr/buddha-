"use client";

import React, { useState, useEffect } from "react";
import { CldVideoPlayer } from "next-cloudinary";

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
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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

    if (!mounted) return <div className={className} style={{ width, height, backgroundColor: '#000' }} />;

    if (!isCloudinary || useNative) {
        // For Cloudinary URLs in native mode, we can still use Cloudinary transformations
        let finalSrc = src;
        let finalPoster = poster;

        if (isCloudinary && useNative) {
            const cloudName = src.split("res.cloudinary.com/")[1]?.split("/")[0];
            // Construct a basic optimized Cloudinary URL for the native video tag
            finalSrc = `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/${publicId}.mp4`;
            if (!finalPoster) {
                finalPoster = `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto,so_0/${publicId}.jpg`;
            }
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
                fetchpriority={id === "hero-video" ? "high" : "auto"}
            />
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
