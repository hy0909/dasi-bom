import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** 이니셜 아바타 색 조합 — 가입 시 프로필 색 선택에서도 같은 배열을 쓴다. */
export const avatarTones = [
  "bg-ink text-canvas",
  "bg-accent text-ink",
  "bg-mute/50 text-ink",
  "bg-primary text-canvas",
];

export function InitialsAvatar({
  name,
  tone = 1,
  className,
  size = "default",
}: {
  name: string;
  tone?: number;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={cn(avatarTones[tone % avatarTones.length])}>
        {name}
      </AvatarFallback>
    </Avatar>
  );
}
