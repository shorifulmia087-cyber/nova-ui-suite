import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface PremiumFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
}

export const PremiumField = forwardRef<HTMLInputElement, PremiumFieldProps>(
  ({ label, icon, error, hint, type = "text", className, value, defaultValue, onChange, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [internal, setInternal] = useState<string>(
      typeof defaultValue === "string" ? defaultValue : "",
    );

    const isControlled = value !== undefined;
    const currentValue = isControlled ? (value as string) : internal;
    const hasValue = currentValue !== undefined && currentValue !== null && String(currentValue).length > 0;
    const isPassword = type === "password";
    const inputType = isPassword ? (showPwd ? "text" : "password") : type;
    const floated = focused || hasValue;

    return (
      <div className="block">
        <div
          className={cn(
            "relative rounded-lg border bg-card transition-all duration-200",
            "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
            focused
              ? "border-primary/40 ring-4 ring-primary/10"
              : error
              ? "border-destructive/50"
              : "border-border hover:border-primary/20",
          )}
        >
          {icon && (
            <span
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors",
                focused && "text-primary",
              )}
            >
              {icon}
            </span>
          )}

          <label
            className={cn(
              "absolute pointer-events-none transition-all duration-200 select-none",
              icon ? "left-11" : "left-4",
              floated
                ? "top-2 text-caption uppercase tracking-wide text-muted-foreground"
                : "top-1/2 -translate-y-1/2 text-input text-muted-foreground",
              focused && floated && "text-primary",
            )}
          >
            {label}
          </label>

          <input
            ref={ref}
            type={inputType}
            value={isControlled ? value : undefined}
            defaultValue={!isControlled ? defaultValue : undefined}
            onChange={(e) => {
              if (!isControlled) setInternal(e.target.value);
              onChange?.(e);
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "w-full bg-transparent outline-none text-[15px] text-foreground placeholder:text-transparent",
              "pt-6 pb-2",
              icon ? "pl-11" : "pl-4",
              isPassword ? "pr-12" : "pr-4",
              className,
            )}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              tabIndex={-1}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error ? (
          <span className="text-caption text-destructive block mt-1.5 ml-1">{error}</span>
        ) : hint ? (
          <span className="text-caption text-muted-foreground block mt-1.5 ml-1">{hint}</span>
        ) : null}
      </div>
    );
  },
);
PremiumField.displayName = "PremiumField";
