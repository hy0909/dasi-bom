import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import type { AuthProvider } from "@/lib/auth";

/** 구글 G 마크 — 브랜드 가이드대로 4색 원본을 유지한다(오렌지 단일 강조 규칙의 예외). */
export function GoogleIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5", className)} {...props}>
      <path
        fill="#4285F4"
        d="M23.06 12.26c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2.01 3.44-4.96 3.44-8.56Z"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.1 0 5.71-1.03 7.62-2.78l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.53-2.02-6.44-4.74H1.72v2.98A11.5 11.5 0 0 0 12 23.5Z"
      />
      <path
        fill="#FBBC05"
        d="M5.56 14.19a6.9 6.9 0 0 1 0-4.38V6.83H1.72a11.5 11.5 0 0 0 0 10.34l3.84-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.68c1.69 0 3.2.58 4.4 1.72l3.29-3.29C17.7 1.24 15.1.5 12 .5A11.5 11.5 0 0 0 1.72 6.83l3.84 2.98C6.47 7.09 9 4.68 12 4.68Z"
      />
    </svg>
  );
}

/** 카카오 말풍선 심볼 — 카카오 버튼 위에서는 항상 검정(#191919)이다. */
export function KakaoIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-5", className)} {...props}>
      <path
        fill="currentColor"
        d="M12 3.2c-5.08 0-9.2 3.26-9.2 7.28 0 2.56 1.68 4.8 4.21 6.1l-1.06 3.9c-.1.35.3.63.6.43l4.66-3.08c.26.02.52.03.79.03 5.08 0 9.2-3.26 9.2-7.28S17.08 3.2 12 3.2Z"
      />
    </svg>
  );
}

export function ProviderIcon({
  provider,
  className,
}: {
  provider: AuthProvider;
  className?: string;
}) {
  return provider === "google" ? (
    <GoogleIcon className={className} />
  ) : (
    <KakaoIcon className={className} />
  );
}
