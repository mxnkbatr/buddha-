import React from "react";

const BlogSkeleton = () => (
  <div className="px-6 space-y-4 py-8">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-32 skeleton rounded-[24px] opacity-60" />
    ))}
  </div>
);

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream page-safe-top">
      <div className="px-6 pt-10 pb-6">
        <div className="h-10 w-48 skeleton rounded-full mb-4" />
        <div className="h-12 w-full skeleton rounded-2xl mb-8" />
      </div>
      <BlogSkeleton />
    </div>
  );
}
