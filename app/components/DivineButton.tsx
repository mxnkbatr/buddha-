"use client";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  className?: string;
};

export default function DivineButton({ children, variant = "primary", icon, className = "", ...props }: Props) {
  const base = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <button className={`${base} ${className}`} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
