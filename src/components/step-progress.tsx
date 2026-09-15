import { Progress } from "@/components/ui/progress";

/**
 * 진행 단계 바.
 * label 은 무엇의 진행인지 알려준다 — 숫자만 두면 사진 장수인지 질문 수인지 읽는 사람이 알 수 없다.
 */
export function StepProgress({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label?: string;
}) {
  return (
    <div className="mt-2 flex items-center gap-3">
      <Progress
        value={(step / total) * 100}
        className="flex-1"
        indicatorClassName="bg-body"
        aria-label={label ? `${label} 진행 단계` : "진행 단계"}
      />
      <small className="text-xs font-semibold text-body">
        {label && <span className="mr-1 font-medium text-body-mid">{label}</span>}
        <span className="tabular-nums">
          {step} / {total}
        </span>
      </small>
    </div>
  );
}
