import { cn } from "@/lib/utils";
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
    <As className={cn("rounded-md bg-card border border-border shadow-card", className)}>
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
    sm: "h-9 px-4 text-xs",
    md: "h-12 px-5 text-sm",
    lg: "h-14 px-6 text-base",
  } as const;
  const variants = {
    brand: "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-95",
    mint: "bg-gradient-mint text-white shadow-glow hover:opacity-95",
    ghost: "bg-muted text-foreground hover:bg-muted/70",
    outline: "border border-border bg-card text-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:opacity-95",
  } as const;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50",
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
    <div className="flex-1 rounded-md bg-card border border-border p-3 shadow-card">
      <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("mt-1 font-bold text-lg font-[var(--font-display)]", tones[tone])}>{value}</div>
    </div>
  );
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-3">
      <h2 className="text-sm font-bold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

