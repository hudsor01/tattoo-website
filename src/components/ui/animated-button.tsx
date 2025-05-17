'use client';

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300 transform hover:scale-105",
          "after:absolute after:inset-0 after:bg-white/20 after:transform after:translate-x-[-100%]",
          "hover:after:translate-x-0 after:transition-transform after:duration-300",
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </Button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

export { AnimatedButton }