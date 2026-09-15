import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * badge — 메타데이터/상태 라벨. 라운드 6px, 채움은 90% 불투명도.
 * default   : canvas-soft 배경 + ink 텍스트 (브랜드 기본)
 * primary   : orange 채움 (강조 상태)
 * primarySoft: orange 를 옅게 깐 상태 칩 — 주요 CTA와 구분된다
 * ink       : 폴라리티 반전 (사진 위 오버레이 등)
 * outline   : 1px ink 헤어라인
 * glass     : 사진 위 캡션 — canvas 채움 + 블러
 */
const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2.5 text-xs font-semibold whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-muted/90 text-foreground",
        primary: "bg-primary/90 text-primary-foreground",
        /** 오렌지 CTA와 부딪히지 않게 같은 색을 옅게 깐 상태 칩 */
        primarySoft: "bg-primary/15 text-primary-deep",
        ink: "bg-ink/90 text-primary-foreground",
        outline: "border-foreground text-foreground",
        glass: "bg-canvas/90 text-body backdrop-blur-sm",
        destructive: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
