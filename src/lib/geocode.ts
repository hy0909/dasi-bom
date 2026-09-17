/**
 * 사진의 GPS 좌표를 지명으로 바꾼다 — '33.46, 126.31' 대신 '제주 애월'.
 *
 * 돈이 드는 길은 쓰지 않는다.
 *  1) OpenStreetMap 의 공개 지명 검색(Nominatim). 열쇠(API key)도 계정도 없고, 요금제 자체가 없다.
 *     이용자가 늘어도 청구서가 생길 수 없는 구조라 그대로 둬도 안전하다.
 *     대신 공용 서버라 예의가 필요해서, 요청은 1초에 한 번으로 늦추고 같은 자리는 다시 묻지 않는다.
 *  2) 위가 막히거나(오프라인·혼잡·차단) 늦으면 아래 내장 좌표표로 가까운 지명을 고른다.
 *     이 길은 네트워크가 아예 없어도 되고, 언제까지나 공짜다.
 *  3) 표에도 없는 먼 곳이면 좌표를 그대로 보여준다 — 틀린 지명을 지어내지 않는다.
 */

export type PlaceName = {
  /** 앨범 본문·연대표에 쓰는 이름 — '제주 애월', '프랑스 파리' */
  place: string;
  /** 사진 위나 목록처럼 좁은 자리에 쓰는 짧은 이름 — '애월', '파리' */
  shortPlace: string;
};

/** 위치를 읽지 못한 사진이 쓰는 이름 */
export const NO_PLACE: PlaceName = { place: "위치 없음", shortPlace: "위치 없음" };

const ENDPOINT = "https://nominatim.openstreetmap.org/reverse";
/** 공용 서버 예의 — 요청 사이에 이만큼 둔다. */
const GAP_MS = 1200;
/** 이만큼 기다려도 답이 없으면 내장 표로 간다 — 사진 추가가 멈춰 있으면 안 된다. */
const TIMEOUT_MS = 5000;

/**
 * 한 번 물어본 자리는 다시 묻지 않는다.
 * 소수점 둘째 자리(약 1km)로 묶으므로, 같은 장소에서 찍은 사진 50장이 요청 한 번이 된다.
 */
const cache = new Map<string, Promise<PlaceName>>();
/** 요청을 한 줄로 세워 1초에 하나씩 내보낸다. 첫 요청은 기다리지 않는다. */
let queue: Promise<unknown> = Promise.resolve();
let sentAt = 0;

export async function placeOf(lat: number, lon: number): Promise<PlaceName> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const known = cache.get(key);
  if (known) return known;

  const asked = resolvePlace(lat, lon);
  cache.set(key, asked);
  return asked;
}

async function resolvePlace(lat: number, lon: number): Promise<PlaceName> {
  const offline = nearestSpot(lat, lon) ?? coordsName(lat, lon);
  // 브라우저가 이미 오프라인을 알고 있으면 헛걸음하지 않는다.
  if (typeof navigator !== "undefined" && navigator.onLine === false) return offline;

  const turn = queue.then(async () => {
    const left = GAP_MS - (Date.now() - sentAt);
    if (left > 0) await wait(left);
    sentAt = Date.now();
  });
  queue = turn;
  await turn;

  try {
    const url =
      `${ENDPOINT}?format=jsonv2&zoom=14&accept-language=ko` +
      `&lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}`;
    const answer = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!answer.ok) return offline;
    const body = (await answer.json()) as { address?: Record<string, string> };
    return (body.address && nameFromAddress(body.address)) ?? offline;
  } catch {
    // 끊겼거나 늦었거나 막혔거나 — 어느 쪽이든 내장 표로 간다.
    return offline;
  }
}

function wait(ms: number) {
  return new Promise((done) => setTimeout(done, ms));
}

/* ── 받아온 주소를 우리 표기로 ─────────────────────────────────────────── */

/** 시·도 이름은 앨범에서 짧게 쓴다 — 충청남도 서산시가 아니라 '충남 서산'. */
const SIDO: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원도: "강원",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주도: "제주",
  제주특별자치도: "제주",
};

/** 구가 시·군 자리에 오는 곳 — 특별시·광역시. 그 밖에서는 시·군이 먼저다. */
const METRO = ["서울", "부산", "대구", "인천", "광주", "대전", "울산"];

function nameFromAddress(a: Record<string, string>): PlaceName | undefined {
  if (a.country_code === "kr") {
    // 시·도는 아는 이름일 때만 쓴다 — 지도 데이터에는 우리가 쓰지 않는 행정 구역 이름도 섞여 있다.
    const region = SIDO[a.province] ?? SIDO[a.state] ?? SIDO[a.city];
    // 사람이 말하는 단위는 시·군·구다. 그 이름이 시·도와 겹치면(제주도 제주시) 한 칸 더 좁힌다.
    // 구는 특별시·광역시에서만 그 자리를 차지한다 — 수원 장안구는 '장안'이 아니라 '수원'이다.
    const city = METRO.includes(region) ? (a.borough ?? a.city) : (a.city ?? a.county ?? a.borough);
    const narrow = a.town ?? a.city_district ?? a.suburb ?? a.village;
    const local = !city || trimUnit(city) === region ? (narrow ?? city) : city;
    const short = local ? trimUnit(local) : region;
    if (!short) return undefined;
    return { place: !region || region === short ? short : `${region} ${short}`, shortPlace: short };
  }

  const local =
    a.city ?? a.town ?? a.village ?? a.municipality ?? a.city_district ?? a.county ?? a.state;
  const country = a.country;
  if (!local && !country) return undefined;
  const short = local ?? country;
  return {
    place: !country || !local || country === local ? short : `${country} ${local}`,
    shortPlace: short,
  };
}

/** '애월읍' → '애월', '성북구' → '성북'. 두 글자만 남는 이름은 그대로 둔다. */
function trimUnit(name: string) {
  const cut = name.replace(/(특별자치도|특별자치시|특별시|광역시)$/, "");
  if (cut.length >= 3) return cut.replace(/[시군구읍면동리]$/, "");
  return cut;
}

/* ── 내장 좌표표 — 네트워크가 없어도 쓰는 길 ────────────────────────────── */

type Spot = { place: string; short: string; lat: number; lon: number };

function spots(list: [string, string, number, number][]): Spot[] {
  return list.map(([place, short, lat, lon]) => ({ place, short, lat, lon }));
}

/** 국내 — 시·군 단위라 촘촘하다. 40km 안이면 그 이름을 쓴다. */
const KOREA = spots([
  ["서울", "서울", 37.5665, 126.978],
  ["인천", "인천", 37.4563, 126.7052],
  ["경기 수원", "수원", 37.2636, 127.0286],
  ["경기 성남", "성남", 37.42, 127.1265],
  ["경기 용인", "용인", 37.2411, 127.1776],
  ["경기 고양", "고양", 37.6584, 126.832],
  ["경기 파주", "파주", 37.7599, 126.78],
  ["경기 가평", "가평", 37.8315, 127.5095],
  ["강원 춘천", "춘천", 37.8813, 127.73],
  ["강원 강릉", "강릉", 37.7519, 128.8761],
  ["강원 속초", "속초", 38.207, 128.5918],
  ["강원 양양", "양양", 38.0754, 128.619],
  ["강원 평창", "평창", 37.3705, 128.39],
  ["강원 원주", "원주", 37.3422, 127.9202],
  ["대전", "대전", 36.3504, 127.3845],
  ["세종", "세종", 36.48, 127.289],
  ["충남 천안", "천안", 36.8151, 127.1139],
  ["충남 서산", "서산", 36.7848, 126.4503],
  ["충남 태안", "태안", 36.7456, 126.298],
  ["충남 공주", "공주", 36.4465, 127.119],
  ["충북 청주", "청주", 36.6424, 127.489],
  ["충북 단양", "단양", 36.9847, 128.3655],
  ["전북 전주", "전주", 35.8242, 127.148],
  ["전북 군산", "군산", 35.9676, 126.737],
  ["전북 남원", "남원", 35.4164, 127.3905],
  ["전남 여수", "여수", 34.7604, 127.6622],
  ["전남 순천", "순천", 34.9506, 127.4872],
  ["광주", "광주", 35.1595, 126.8526],
  ["전남 목포", "목포", 34.8118, 126.3922],
  ["전남 담양", "담양", 35.3211, 126.988],
  ["대구", "대구", 35.8714, 128.6014],
  ["경북 경주", "경주", 35.8562, 129.2247],
  ["경북 포항", "포항", 36.019, 129.3435],
  ["경북 안동", "안동", 36.5684, 128.7294],
  ["부산", "부산", 35.1796, 129.0756],
  ["울산", "울산", 35.5384, 129.3114],
  ["경남 창원", "창원", 35.2279, 128.6811],
  ["경남 통영", "통영", 34.8544, 128.4331],
  ["경남 거제", "거제", 34.8806, 128.6211],
  ["경남 남해", "남해", 34.8376, 127.8925],
  ["경남 진주", "진주", 35.18, 128.1076],
  ["제주", "제주", 33.4996, 126.5312],
  ["제주 애월", "애월", 33.4629, 126.3106],
  ["제주 협재", "협재", 33.394, 126.24],
  ["제주 성산", "성산", 33.458, 126.942],
  ["제주 서귀포", "서귀포", 33.2541, 126.5601],
  ["경북 울릉", "울릉", 37.4845, 130.9057],
]);

/** 해외 — 도시 단위라 성글다. 150km 안이면 그 도시로 본다. */
const WORLD = spots([
  ["일본 도쿄", "도쿄", 35.6762, 139.6503],
  ["일본 오사카", "오사카", 34.6937, 135.5023],
  ["일본 교토", "교토", 35.0116, 135.7681],
  ["일본 삿포로", "삿포로", 43.0618, 141.3545],
  ["일본 후쿠오카", "후쿠오카", 33.5904, 130.4017],
  ["일본 오키나와", "오키나와", 26.2124, 127.6809],
  ["대만 타이베이", "타이베이", 25.033, 121.5654],
  ["홍콩", "홍콩", 22.3193, 114.1694],
  ["중국 베이징", "베이징", 39.9042, 116.4074],
  ["중국 상하이", "상하이", 31.2304, 121.4737],
  ["싱가포르", "싱가포르", 1.3521, 103.8198],
  ["태국 방콕", "방콕", 13.7563, 100.5018],
  ["태국 푸껫", "푸껫", 7.8804, 98.3923],
  ["베트남 다낭", "다낭", 16.0544, 108.2022],
  ["베트남 하노이", "하노이", 21.0278, 105.8342],
  ["베트남 호찌민", "호찌민", 10.8231, 106.6297],
  ["필리핀 세부", "세부", 10.3157, 123.8854],
  ["인도네시아 발리", "발리", -8.4095, 115.1889],
  ["말레이시아 쿠알라룸푸르", "쿠알라룸푸르", 3.139, 101.6869],
  ["괌", "괌", 13.4443, 144.7937],
  ["사이판", "사이판", 15.177, 145.75],
  ["미국 하와이", "하와이", 21.3069, -157.8583],
  ["미국 로스앤젤레스", "로스앤젤레스", 34.0522, -118.2437],
  ["미국 샌프란시스코", "샌프란시스코", 37.7749, -122.4194],
  ["미국 시애틀", "시애틀", 47.6062, -122.3321],
  ["미국 라스베이거스", "라스베이거스", 36.1699, -115.1398],
  ["미국 뉴욕", "뉴욕", 40.7128, -74.006],
  ["캐나다 밴쿠버", "밴쿠버", 49.2827, -123.1207],
  ["캐나다 토론토", "토론토", 43.6532, -79.3832],
  ["프랑스 파리", "파리", 48.8566, 2.3522],
  ["프랑스 니스", "니스", 43.7102, 7.262],
  ["영국 런던", "런던", 51.5074, -0.1278],
  ["스페인 바르셀로나", "바르셀로나", 41.3874, 2.1686],
  ["스페인 마드리드", "마드리드", 40.4168, -3.7038],
  ["이탈리아 로마", "로마", 41.9028, 12.4964],
  ["이탈리아 베네치아", "베네치아", 45.4408, 12.3155],
  ["이탈리아 피렌체", "피렌체", 43.7696, 11.2558],
  ["이탈리아 밀라노", "밀라노", 45.4642, 9.19],
  ["독일 베를린", "베를린", 52.52, 13.405],
  ["독일 뮌헨", "뮌헨", 48.1351, 11.582],
  ["체코 프라하", "프라하", 50.0755, 14.4378],
  ["오스트리아 빈", "빈", 48.2082, 16.3738],
  ["스위스 취리히", "취리히", 47.3769, 8.5417],
  ["스위스 인터라켄", "인터라켄", 46.6863, 7.8632],
  ["네덜란드 암스테르담", "암스테르담", 52.3676, 4.9041],
  ["포르투갈 리스본", "리스본", 38.7223, -9.1393],
  ["그리스 아테네", "아테네", 37.9838, 23.7275],
  ["튀르키예 이스탄불", "이스탄불", 41.0082, 28.9784],
  ["아랍에미리트 두바이", "두바이", 25.2048, 55.2708],
  ["호주 시드니", "시드니", -33.8688, 151.2093],
  ["호주 멜버른", "멜버른", -37.8136, 144.9631],
  ["뉴질랜드 오클랜드", "오클랜드", -36.8485, 174.7633],
  ["핀란드 헬싱키", "헬싱키", 60.1699, 24.9384],
  ["아이슬란드 레이캬비크", "레이캬비크", 64.1466, -21.9426],
  ["러시아 블라디보스토크", "블라디보스토크", 43.1155, 131.8855],
]);

/** 표에서 가장 가까운 곳 — 국내는 40km, 해외는 150km 안일 때만 그 이름을 쓴다. */
function nearestSpot(lat: number, lon: number): PlaceName | undefined {
  const pick = (list: Spot[], limitKm: number) => {
    let best: Spot | undefined;
    let bestKm = limitKm;
    for (const spot of list) {
      const km = distanceKm(lat, lon, spot.lat, spot.lon);
      if (km < bestKm) [best, bestKm] = [spot, km];
    }
    return best;
  };
  const found = pick(KOREA, 40) ?? pick(WORLD, 150);
  return found && { place: found.place, shortPlace: found.short };
}

/** 두 좌표 사이 거리(km) — 가까운 거리라 평면으로 재도 충분하다. */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const x = (lon1 - lon2) * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  const y = lat1 - lat2;
  return Math.hypot(x, y) * 111.32;
}

/** 이름을 못 찾았을 때 — 지명을 지어내는 대신 좌표를 그대로 적는다. */
export function coordsName(lat: number, lon: number): PlaceName {
  return {
    place: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
    shortPlace: `${lat.toFixed(1)}, ${lon.toFixed(1)}`,
  };
}
