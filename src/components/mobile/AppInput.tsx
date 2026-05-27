import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/lib/typography";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

/**
 * AppInput — premium reusable input used across the app.
 * - Clean white surface, crisp 1.5px border, soft elevation
 * - Animated accent focus ring, clear error state
 * - High-contrast typed text + readable placeholder
 */
export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      label,
      leftIcon,
      rightIcon,
      error,
      hint,
      className,
      containerClassName,
      id,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || rest.name;

    return (
      <div className={cn("block", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block mb-2">
            <Text variant="body" as="span" className="text-foreground font-medium">
              {label}
            </Text>
          </label>
        )}
        <div
          className={cn(
            "relative flex items-center rounded-lg bg-card",
            "transition-all duration-200 ease-out",
            "border-[1.5px]",
            error
              ? "border-[color:var(--destructive)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--destructive)_12%,transparent)]"
              : focused
              ? "border-[color:var(--accent)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_14%,transparent)]"
              : "border-border elevation-1 hover:border-[color:color-mix(in_oklab,var(--accent)_35%,var(--border))]",
          )}
        >
          {leftIcon && (
            <span
              className={cn(
                "pl-4 pr-1 flex items-center transition-colors",
                focused ? "text-[color:var(--accent)]" : "text-muted-foreground",
              )}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "text-input w-full h-14 bg-transparent outline-none",
              "text-foreground placeholder:text-muted-foreground/60",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]",
              "[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]",
              leftIcon ? "pl-2" : "pl-4",
              rightIcon ? "pr-2" : "pr-4",
              className,
            )}
            {...rest}
          />
          {rightIcon && (
            <span
              className={cn(
                "pr-4 pl-1 flex items-center transition-colors",
                focused ? "text-[color:var(--accent)]" : "text-muted-foreground",
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <Text variant="caption" className="text-[color:var(--destructive)] mt-1.5 block font-medium">
            {error}
          </Text>
        ) : hint ? (
          <Text variant="caption" className="text-muted-foreground mt-1.5 block">
            {hint}
          </Text>
        ) : null}
      </div>
    );
  },
);
AppInput.displayName = "AppInput";
