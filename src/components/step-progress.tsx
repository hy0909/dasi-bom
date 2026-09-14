import { Progress } from "@/components/ui/progress";

export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <Progress
        value={(step / total) * 100}
        className="flex-1"
        indicatorClassName="bg-body"
        aria-label="진행 단계"
      />
      <small className="text-xs font-semibold tabular-nums text-body">
        {step} / {total}
      </small>
    </div>
  );
}
