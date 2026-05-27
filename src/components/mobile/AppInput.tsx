import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
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
 * AppInput — the single reusable input used across the app.
 * - White card background, visible foreground text color
 * - Optional label, leading/trailing icon, error + hint
 * - Focus ring uses accent; error state uses destructive
 */
export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  (
    { label, leftIcon, rightIcon, error, hint, className, containerClassName, id, ...rest },
    ref,
  ) => {
    const inputId = id || rest.name;
    return (
      <div className={cn("block", containerClassName)}>
        {label && (
          <Text variant="label" as="label" htmlFor={inputId} className="block mb-1.5 text-foreground">
            {label}
          </Text>
        )}
        <div
          className={cn(
            "relative flex items-center rounded-lg border bg-card transition-colors",
            error
              ? "border-[color:var(--destructive)] focus-within:ring-2 focus-within:ring-[color:var(--destructive)]"
              : "border-border focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]/30",
          )}
        >
          {leftIcon && (
            <span className="pl-3 pr-1 text-muted-foreground flex items-center">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "text-input w-full h-12 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/70",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]",
              leftIcon ? "pl-2" : "pl-3",
              rightIcon ? "pr-2" : "pr-3",
              className,
            )}
            {...rest}
          />
          {rightIcon && (
            <span className="pr-3 pl-1 text-muted-foreground flex items-center">{rightIcon}</span>
          )}
        </div>
        {error ? (
          <Text variant="caption" className="text-[color:var(--destructive)] mt-1.5 block">
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
