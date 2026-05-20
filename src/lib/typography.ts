/**
 * Typography Token System — single source of truth.
 *
 * Use the CSS utility classes (`text-display`, `text-screen-title`, …) in JSX.
 * This module exposes the same tokens to TS for charts, canvas, or runtime use,
 * and provides a `<Text variant="...">` component for ergonomic JSX usage.
 *
 * Allowed font weights: 400 / 500 / 600 / 700. Nothing else.
 */

import { type ElementType, type HTMLAttributes, createElement } from "react";
import { cn } from "@/lib/utils";

export const FONT_FAMILY = '"Google Sans", "DM Sans", system-ui, sans-serif' as const;

export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export type TypographyToken =
  | "display"
  | "screenTitle"
  | "sectionTitle"
  | "cardTitle"
  | "body"
  | "bodySecondary"
  | "label"
  | "button"
  | "caption"
  | "tab"
  | "input"
  | "stat";

export const TYPOGRAPHY: Record<
  TypographyToken,
  { fontSize: number; lineHeight: number; fontWeight: 400 | 500 | 600 | 700; className: string }
> = {
  display:       { fontSize: 32, lineHeight: 40, fontWeight: 700, className: "text-display" },
  screenTitle:   { fontSize: 24, lineHeight: 32, fontWeight: 700, className: "text-screen-title" },
  sectionTitle:  { fontSize: 20, lineHeight: 28, fontWeight: 600, className: "text-section-title" },
  cardTitle:     { fontSize: 18, lineHeight: 26, fontWeight: 600, className: "text-card-title" },
  body:          { fontSize: 16, lineHeight: 24, fontWeight: 400, className: "text-body" },
  bodySecondary: { fontSize: 14, lineHeight: 20, fontWeight: 400, className: "text-body-secondary" },
  label:         { fontSize: 14, lineHeight: 20, fontWeight: 500, className: "text-label" },
  button:        { fontSize: 16, lineHeight: 24, fontWeight: 600, className: "text-button" },
  caption:       { fontSize: 12, lineHeight: 16, fontWeight: 400, className: "text-caption" },
  tab:           { fontSize: 12, lineHeight: 16, fontWeight: 500, className: "text-tab" },
  input:         { fontSize: 16, lineHeight: 24, fontWeight: 400, className: "text-input" },
  stat:          { fontSize: 28, lineHeight: 36, fontWeight: 700, className: "text-stat" },
};

export function typographyClass(token: TypographyToken): string {
  return TYPOGRAPHY[token].className;
}

type TextProps = HTMLAttributes<HTMLElement> & {
  variant: TypographyToken;
  as?: ElementType;
};

/** Semantic typography component — `<Text variant="cardTitle">…</Text>`. */
export function Text({ variant, as, className, children, ...rest }: TextProps) {
  const Tag = (as ?? "span") as ElementType;
  return createElement(
    Tag,
    { className: cn(TYPOGRAPHY[variant].className, className), ...rest },
    children,
  );
}
