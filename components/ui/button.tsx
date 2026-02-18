import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] select-none cursor-pointer",
  {
    variants: {
      variant: {
        // Gold — the primary CTA
        default:
          "bg-gradient-to-r from-gold to-goldDark text-dark shadow-gold-sm hover:shadow-gold hover:from-goldLight hover:to-gold transition-all duration-200",
        // Gold with glow ring — hero CTAs
        glow:
          "bg-gradient-to-r from-gold to-goldDark text-dark shadow-gold animate-glow-pulse hover:shadow-gold-lg transition-all duration-300",
        // Danger
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow-md transition-all duration-200",
        // Gold border, transparent fill
        outline:
          "border-2 border-gold/60 bg-transparent text-gold hover:bg-gold/10 hover:border-gold transition-all duration-200 dark:border-gold/50 dark:text-gold",
        // Subdued — dark surface
        secondary:
          "bg-darkSurface border border-darkBorder text-slate-200 hover:bg-darkElevated hover:border-gold/30 hover:text-gold transition-all duration-200 dark:bg-darkSurface dark:border-darkBorder",
        // Transparent with hover
        ghost:
          "hover:bg-gold/10 hover:text-gold text-foreground transition-all duration-200",
        // Text link
        link:
          "text-gold underline-offset-4 hover:underline transition-colors duration-150",
        // Success
        success:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md transition-all duration-200",
        // Warning / Amber
        warning:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm hover:from-amber-600 hover:to-amber-700 hover:shadow-md transition-all duration-200",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-9 rounded-lg px-4 text-xs",
        lg:      "h-12 rounded-xl px-8 text-base",
        xl:      "h-14 rounded-2xl px-10 text-lg",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
