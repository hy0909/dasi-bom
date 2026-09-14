import { Bell, LayoutGrid, Plus, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Go, Screen } from "@/types";

const items: { key: Screen; label: string; icon: typeof Bell; count?: number }[] = [
  { key: "home", label: "앨범", icon: LayoutGrid },
  { key: "invite", label: "초대", icon: Users },
  { key: "notices", label: "알림", icon: Bell, count: 2 },
  { key: "profile", label: "나", icon: User },
];

export function BottomNav({ go, active = "home" }: { go: Go; active?: Screen }) {
  const [a, b, c, d] = items;
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="grid h-[68px] grid-cols-5 items-center px-2">
        <NavItem item={a} active={active === a.key} go={go} />
        <NavItem item={b} active={active === b.key} go={go} />
        <div className="flex justify-center">
          <Button
            size="icon-lg"
            onClick={() => go("create")}
            aria-label="새 앨범 만들기"
            className="-translate-y-4 shadow-float"
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </Button>
        </div>
        <NavItem item={c} active={active === c.key} go={go} />
        <NavItem item={d} active={active === d.key} go={go} />
      </div>
    </nav>
  );
}

function NavItem({
  item,
  active,
  go,
}: {
  item: (typeof items)[number];
  active: boolean;
  go: Go;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => go(item.key)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-full flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        active ? "text-ink" : "text-body-mid hover:text-body",
      )}
    >
      <span className="relative">
        <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.9} />
        {item.count ? (
          <i className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-bold text-canvas not-italic">
            {item.count}
          </i>
        ) : null}
      </span>
      {item.label}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-1.5 size-1 rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
