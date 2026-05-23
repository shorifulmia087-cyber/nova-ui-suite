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
import { clsx } from "clsx";

export const FONT_FAMILY = '"Prompt", "Hind Siliguri", system-ui, sans-serif' as const;

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
  sectionTitle:  { fontSize: 20, lineHeight: 28, fontWeight: 700, className: "text-section-title" },
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

/**
 * Case formatting tokens — single source of truth for text casing.
 * Use via `<Text case="...">` / `<Heading case="...">` instead of raw
 * Tailwind `uppercase` / `capitalize` classes in components.
 */
export type CaseToken = "none" | "title" | "upper" | "lower" | "sentence";

const CASE_CLASS: Record<CaseToken, string> = {
  none: "",
  title: "capitalize",
  upper: "uppercase tracking-[0.08em]",
  lower: "lowercase",
  sentence: "normal-case first-letter:uppercase",
};

export function caseClass(token: CaseToken = "none"): string {
  return CASE_CLASS[token];
}

type TextProps = HTMLAttributes<HTMLElement> & {
  variant: TypographyToken;
  as?: ElementType;
  case?: CaseToken;
};

/** Semantic typography component — `<Text variant="cardTitle" case="title">…</Text>`. */
export function Text({ variant, as, case: caseToken = "none", className, children, ...rest }: TextProps) {
  const Tag = (as ?? "span") as ElementType;
  return createElement(
    Tag,
    { className: clsx(TYPOGRAPHY[variant].className, caseClass(caseToken), className), ...rest },
    children,
  );
}

/** Semantic heading — defaults to a real <h*> tag matching the variant. */
const HEADING_TAG: Partial<Record<TypographyToken, ElementType>> = {
  display: "h1",
  screenTitle: "h1",
  sectionTitle: "h2",
  cardTitle: "h3",
};

type HeadingProps = Omit<TextProps, "variant"> & { variant?: TypographyToken };

export function Heading({
  variant = "sectionTitle",
  as,
  case: caseToken = "none",
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = (as ?? HEADING_TAG[variant] ?? "h2") as ElementType;
  return createElement(
    Tag,
    { className: clsx(TYPOGRAPHY[variant].className, caseClass(caseToken), className), ...rest },
    children,
  );
}
