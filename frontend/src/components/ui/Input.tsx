import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, error = false, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-cs-muted">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-10 rounded-xl bg-cs-surface border border-cs-border px-3.5 text-sm text-cs-text placeholder:text-cs-muted/60 transition-all focus:outline-none focus:border-cs-primary focus:ring-2 focus:ring-cs-primary/20 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed shadow-xs",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-cs-danger focus:border-cs-danger focus:ring-cs-danger/20",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-cs-muted">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
