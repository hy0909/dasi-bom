/**
 * 커버 색 시안 전환 — 주소에 ?cover=vivid 를 붙이면 B안.
 * A안(기본): 커버는 차분한 패브릭 톤, 배너 배경이 쨍한 색.
 * B안: 커버 자체가 쨍한 색, 배너 배경은 그 색의 연한 톤.
 */
export const coverVariant: "fabric" | "vivid" =
  new URLSearchParams(window.location.search).get("cover") === "vivid" ? "vivid" : "fabric";
