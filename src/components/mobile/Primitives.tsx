import { cn } from "@/lib/utils";
import { Heading } from "@/lib/typography";
import { type ReactNode, type ButtonHTMLAttributes } from "react";

export function Card({
  className,
  children,
  as: As = "div",
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "article";
}) {
  return (
    <As className={cn("rounded-lg bg-card border border-border shadow-card", className)}>
      {children}
    </As>
  );
}

interface PrimaryBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "mint" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export function ActionButton({
  className,
  variant = "brand",
  size = "md",
  children,
  ...rest
}: PrimaryBtnProps) {
  const sizes = {
    sm: "h-9 px-4",
    md: "h-12 px-4",
    lg: "h-14 px-6",
  } as const;
  const variants = {
    brand: "bg-primary text-primary-foreground shadow-card hover:bg-primary/90 active:bg-primary/95",
    mint: "bg-accent text-accent-foreground shadow-card hover:bg-accent/90 active:bg-accent/95",
    ghost: "bg-muted text-foreground hover:bg-muted/70",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  } as const;
  return (
    <button
      className={cn(
        "text-button inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50",
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function StatPill({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "text-foreground",
    success: "text-[color:var(--success)]",
    warning: "text-[color:var(--warning)]",
    danger: "text-destructive",
  } as const;
  return (
    <div className="flex-1 rounded-lg bg-card border border-border p-card shadow-card">
      <div className="text-caption flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("mt-1 text-card-title", tones[tone])}>{value}</div>
    </div>
  );
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-3">
      <Heading variant="sectionTitle" case="sentence">{children}</Heading>
      {action}
    </div>
  );
}
