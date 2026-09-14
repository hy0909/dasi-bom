import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** 12px 라운드 프레임 안의 사진 + 캡션 필. 사진은 항상 rounded.md 프레임 안에. */
export function MediaFrame({
  src,
  alt,
  caption,
  ratio = "aspect-[4/3]",
  className,
  children,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  ratio?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted", ratio, className)}>
      <img src={src} alt={alt} className="size-full object-cover" />
      {caption && (
        <Badge variant="glass" className="absolute bottom-3 left-3">
          {caption}
        </Badge>
      )}
      {children}
    </div>
  );
}
