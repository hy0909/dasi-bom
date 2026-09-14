import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const tones = [
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
      <AvatarFallback className={cn(tones[tone % tones.length])}>{name}</AvatarFallback>
    </Avatar>
  );
}
