"use client";
export default function DivineBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-cream">
      {/* Subtle top ambient — зөвхөн нэг div, animation үгүй */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(217,119,6,0.05)_0%,_transparent_60%)]" />
    </div>
  );
}
