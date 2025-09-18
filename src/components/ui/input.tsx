import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:text-primary-foreground dark:bg-input/30 border-input flex w-full h-12 rounded-lg px-3 py-3 font-inter text-base leading-[150%] tracking-[0.2px] focus-visible:border-ring focus-visible:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }