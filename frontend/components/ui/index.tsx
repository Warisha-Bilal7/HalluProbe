import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", isLoading = false, children, className, disabled, ...props },
    ref
  ) => {
    const baseStyles =
      "font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#070a13] flex items-center justify-center gap-2";
    
    const variants = {
      primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 hover:scale-[1.02] active:scale-[0.98] focus:ring-violet-500",
      secondary: "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-gray-200 hover:scale-[1.02] active:scale-[0.98] focus:ring-gray-500",
      danger: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/35 hover:scale-[1.02] active:scale-[0.98] focus:ring-rose-500",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-7 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3.5 py-2.5 bg-white/[0.02] border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-200 ${
            error
              ? "border-rose-500/50 focus:ring-rose-500/20"
              : "border-white/[0.08] hover:border-white/20 focus:border-violet-500 focus:ring-violet-500/25"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3.5 py-2.5 bg-white/[0.02] border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-gray-500 transition-all duration-200 ${
            error
              ? "border-rose-500/50 focus:ring-rose-500/20"
              : "border-white/[0.08] hover:border-white/20 focus:border-violet-500 focus:ring-violet-500/25"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`glass-panel rounded-xl p-6 relative ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "danger" | "warning";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className,
  ...props
}) => {
  const variants = {
    default: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    success: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]",
    danger: "bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.1)]",
    warning: "bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]",
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
        variants[variant]
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface LoaderProps {
  size?: "sm" | "md" | "lg";
}

export const Loader: React.FC<LoaderProps> = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-9 h-9",
    lg: "w-14 h-14",
  };

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-20"></span>
      <svg
        className="animate-spin w-full h-full text-violet-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-10"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  message,
  className,
  ...props
}) => {
  const variants = {
    info: "bg-blue-950/20 border-blue-500/20 text-blue-300",
    success: "bg-emerald-950/20 border-emerald-500/20 text-emerald-300",
    warning: "bg-amber-950/20 border-amber-500/20 text-amber-300",
    error: "bg-rose-950/20 border-rose-500/20 text-rose-300",
  };

  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "🚨",
  };

  return (
    <div
      className={`border rounded-lg p-4 flex gap-3 ${variants[variant]} ${className}`}
      {...props}
    >
      <div className="text-lg flex-shrink-0">{icons[variant]}</div>
      <div className="space-y-1">
        {title && <h3 className="font-semibold text-sm">{title}</h3>}
        <p className="text-xs leading-relaxed opacity-90">{message}</p>
      </div>
    </div>
  );
};
