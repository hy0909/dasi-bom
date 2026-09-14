import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Zapier 스타일 버튼
 * - default   : button-primary   (orange fill · on-primary text)
 * - secondary : button-secondary (ink fill · on-primary text)
 * - outline   : button-tertiary  (canvas fill · 1px ink border)
 * - ghost     : button-text      (텍스트 버튼, 14px/700)
 * 모든 버튼은 rounded.md 12px — 필(pill) 아님.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-[background-color,color,border-color,transform,opacity] duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.15em]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-deep",
        secondary: "bg-secondary text-secondary-foreground hover:bg-ink-soft",
        outline:
          "border-foreground bg-background text-foreground hover:bg-muted aria-expanded:bg-muted",
        ghost:
          "text-foreground hover:bg-muted aria-expanded:bg-muted font-bold",
        /** 정렬·필터처럼 보조적인 토글 — 배경에 가까운 연한 뉴트럴 */
        quiet:
          "text-body-mid font-semibold hover:bg-muted hover:text-body aria-expanded:bg-muted",
        soft: "bg-muted text-foreground hover:bg-accent",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-foreground underline underline-offset-4 hover:text-primary",
      },
      size: {
        default: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-[17px]",
        sm: "h-9 px-4 text-sm font-bold tracking-[0.01em]",
        xs: "h-7 px-2.5 text-xs font-bold rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-11",
        "icon-lg": "size-12",
        "icon-sm": "size-9",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
