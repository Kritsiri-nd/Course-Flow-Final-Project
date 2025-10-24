import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-blue-600",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingPageProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingPage({ 
  message = "Loading...", 
  size = "lg",
  className 
}: LoadingPageProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gray-50 relative overflow-hidden flex items-center justify-center",
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingCard({ 
  message = "Loading...", 
  size = "md",
  className 
}: LoadingCardProps) {
  return (
    <div className={cn(
      "flex items-center justify-center p-8",
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-2" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface LoadingTableRowProps {
  colSpan: number;
  message?: string;
}

export function LoadingTableRow({ colSpan, message = "Loading..." }: LoadingTableRowProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="p-10 text-center text-gray-800"
      >
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          {message}
        </div>
      </td>
    </tr>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{
            width: i === lines - 1 ? "75%" : "100%"
          }}
        />
      ))}
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: string;
}

export function LoadingButton({ 
  loading = false, 
  children, 
  className,
  disabled = false,
  variant,
  ...props 
}: LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "px-4 py-2 rounded-md text-sm font-medium",
        "bg-blue-600 text-white hover:bg-blue-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-colors",
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}
