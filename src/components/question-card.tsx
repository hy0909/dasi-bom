import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** card-feature-dark — AI 질문 카드. ink 채움 위에 오렌지 아이콘 블록 하나. */
export function QuestionCard({
  eyebrow,
  question,
  children,
}: {
  eyebrow: ReactNode;
  question: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card variant="dark" className="mt-5">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-canvas">
            <Sparkles className="size-4" />
          </span>
          <p className="text-sm font-medium text-canvas-soft/75">{eyebrow}</p>
        </div>
        <h1 className="font-heading text-display-md font-medium text-canvas">{question}</h1>
        {children}
      </CardContent>
    </Card>
  );
}
