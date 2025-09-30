import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-[453px] h-12 rounded-lg border border-[#D6D9E4] bg-white pt-3 pr-4 pb-3 pl-3 font-inter font-normal text-base leading-[150%] tracking-[0%] text-black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#9AA1B9] focus-visible:outline-none focus-visible:border-[#F47E20] disabled:cursor-not-allowed disabled:opacity-50",
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
