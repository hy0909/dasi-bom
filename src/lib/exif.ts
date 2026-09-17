/**
 * 사진 파일에 적혀 있는 촬영 정보를 읽는다 — 촬영 시각과 촬영 위치(GPS).
 *
 * 외부 라이브러리 없이 EXIF 를 직접 읽는다. 읽는 곳은 세 가지다.
 *  - JPEG: 앞쪽 세그먼트를 따라가 APP1(Exif) 을 찾는다
 *  - PNG: eXIf 청크
 *  - HEIC·TIFF 등: 파일 앞부분에서 'Exif' 표식을 찾아 그 뒤의 TIFF 를 읽는다
 * 어디에도 없으면 아무것도 돌려주지 않는다 — 촬영 시각은 파일 시각으로 갈음한다.
 */

export type PhotoMeta = {
  /** 촬영 시각 — 로컬 기준 ISO(초까지). EXIF 에 없으면 없다. */
  takenAt?: string;
  /** 촬영 위치 — EXIF GPS. 없으면 없다. */
  coords?: { lat: number; lon: number };
};

/** JPEG 의 Exif 는 파일 맨 앞에 붙는다 — 이만큼만 읽어도 충분하다. */
const HEAD_BYTES = 512 * 1024;
/** HEIC 처럼 표식을 찾아야 하는 파일은 조금 더 넓게 훑는다. */
const SCAN_BYTES = 2 * 1024 * 1024;

/** TIFF 항목의 자료형별 바이트 수 — 1 BYTE, 2 ASCII … 10 SRATIONAL */
const TYPE_SIZE = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8];

/** IFD0 */
const TAG_DATE_TIME = 0x0132;
const TAG_EXIF_IFD = 0x8769;
const TAG_GPS_IFD = 0x8825;
/** Exif IFD */
const TAG_DATE_TIME_ORIGINAL = 0x9003;
const TAG_DATE_TIME_DIGITIZED = 0x9004;
/** GPS IFD */
const TAG_LAT_REF = 0x0001;
const TAG_LAT = 0x0002;
const TAG_LON_REF = 0x0003;
const TAG_LON = 0x0004;

export async function readPhotoMeta(file: File): Promise<PhotoMeta> {
  try {
    const jpeg = file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name);
    const head = new DataView(await file.slice(0, jpeg ? HEAD_BYTES : SCAN_BYTES).arrayBuffer());
    // JPEG 은 세그먼트를 따라가는 쪽이 정확하다. 그래도 못 찾으면 표식을 훑는 쪽으로 한 번 더 본다.
    const tiff = (jpeg ? tiffInJpeg(head) : undefined) ?? tiffElsewhere(head);
    return tiff === undefined ? {} : readTiff(head, tiff);
  } catch {
    // 잘린 파일이든 우리가 모르는 형식이든, 촬영 정보가 없는 사진으로 다룬다.
    return {};
  }
}

/** JPEG 세그먼트를 따라가 Exif APP1 안의 TIFF 시작 위치를 찾는다. */
function tiffInJpeg(view: DataView) {
  if (view.getUint16(0) !== 0xffd8) return undefined; // SOI 가 아니면 JPEG 이 아니다
  let at = 2;
  while (at + 4 <= view.byteLength) {
    if (view.getUint8(at) !== 0xff) return undefined;
    const marker = view.getUint8(at + 1);
    // SOS(0xda) 부터는 사진 데이터다 — 여기까지 없으면 Exif 가 없는 사진이다.
    if (marker === 0xda || marker === 0xd9) return undefined;
    const size = view.getUint16(at + 2);
    if (marker === 0xe1 && ascii(view, at + 4, 4) === "Exif") return at + 10;
    at += 2 + size;
  }
  return undefined;
}

/** PNG 의 eXIf 청크, 그 밖(HEIC 등)에서는 'Exif' 표식을 찾아 TIFF 시작 위치를 돌려준다. */
function tiffElsewhere(view: DataView) {
  // 파일 자체가 TIFF 면 맨 앞이 곧 TIFF 헤더다.
  if (byteOrderAt(view, 0)) return 0;
  for (let at = 0; at + 8 < view.byteLength; at++) {
    const tag = ascii(view, at, 4);
    // PNG: 길이 4바이트 뒤에 'eXIf', 그다음이 바로 TIFF
    if (tag === "eXIf" && byteOrderAt(view, at + 4)) return at + 4;
    // HEIC·JPEG: 'Exif' 표식 뒤에 0x00 0x00 이 붙고 TIFF 가 이어진다
    if (tag === "Exif" && byteOrderAt(view, at + 6)) return at + 6;
  }
  return undefined;
}

/** 이 자리가 TIFF 헤더인가 — 맞으면 바이트 순서를 돌려준다. */
function byteOrderAt(view: DataView, at: number) {
  if (at + 4 > view.byteLength) return undefined;
  const order = view.getUint16(at);
  if (order !== 0x4949 && order !== 0x4d4d) return undefined;
  const little = order === 0x4949;
  return view.getUint16(at + 2, little) === 42 ? { little } : undefined;
}

/** TIFF 를 열어 촬영 시각과 GPS 를 뽑는다. */
function readTiff(view: DataView, tiff: number): PhotoMeta {
  const order = byteOrderAt(view, tiff);
  if (!order) return {};
  const { little } = order;

  const ifd0 = readIfd(view, tiff, tiff + view.getUint32(tiff + 4, little), little);
  const exif = ifd0[TAG_EXIF_IFD]
    ? readIfd(view, tiff, tiff + Number(ifd0[TAG_EXIF_IFD].number), little)
    : {};
  const gps = ifd0[TAG_GPS_IFD]
    ? readIfd(view, tiff, tiff + Number(ifd0[TAG_GPS_IFD].number), little)
    : {};

  const meta: PhotoMeta = {};

  // 촬영한 시각이 우선이고, 없으면 저장한 시각·파일이 적어 둔 시각 순으로 본다.
  const stamp =
    exif[TAG_DATE_TIME_ORIGINAL]?.text ??
    exif[TAG_DATE_TIME_DIGITIZED]?.text ??
    ifd0[TAG_DATE_TIME]?.text;
  const takenAt = parseExifDate(stamp);
  if (takenAt) meta.takenAt = takenAt;

  const lat = degrees(gps[TAG_LAT]?.numbers, gps[TAG_LAT_REF]?.text);
  const lon = degrees(gps[TAG_LON]?.numbers, gps[TAG_LON_REF]?.text);
  // 0,0 은 GPS 를 못 잡은 사진이 남기는 값이라 위치로 치지 않는다.
  if (lat !== undefined && lon !== undefined && (lat !== 0 || lon !== 0)) meta.coords = { lat, lon };

  return meta;
}

type Entry = { text?: string; number?: number; numbers?: number[] };

/** IFD 한 벌을 태그별로 읽어 둔다. */
function readIfd(view: DataView, tiff: number, at: number, little: boolean) {
  const out: Record<number, Entry> = {};
  if (at + 2 > view.byteLength) return out;
  const count = view.getUint16(at, little);
  for (let i = 0; i < count; i++) {
    const entry = at + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    const tag = view.getUint16(entry, little);
    const type = view.getUint16(entry + 2, little);
    const length = view.getUint32(entry + 4, little);
    const size = (TYPE_SIZE[type] ?? 0) * length;
    if (size === 0) continue;
    // 값이 4바이트를 넘으면 자리에 주소가 적혀 있다.
    const value = size > 4 ? tiff + view.getUint32(entry + 8, little) : entry + 8;
    if (value + size > view.byteLength) continue;
    out[tag] = readValue(view, value, type, length, little);
  }
  return out;
}

function readValue(
  view: DataView,
  at: number,
  type: number,
  length: number,
  little: boolean,
): Entry {
  if (type === 2) return { text: ascii(view, at, length).replace(/\0.*$/, "").trim() };
  const numbers: number[] = [];
  for (let i = 0; i < length; i++) {
    const p = at + i * TYPE_SIZE[type];
    if (type === 1) numbers.push(view.getUint8(p));
    else if (type === 3) numbers.push(view.getUint16(p, little));
    else if (type === 4) numbers.push(view.getUint32(p, little));
    else if (type === 9) numbers.push(view.getInt32(p, little));
    else if (type === 5 || type === 10) {
      const top = type === 5 ? view.getUint32(p, little) : view.getInt32(p, little);
      const bottom = type === 5 ? view.getUint32(p + 4, little) : view.getInt32(p + 4, little);
      numbers.push(bottom === 0 ? 0 : top / bottom);
    }
  }
  return { numbers, number: numbers[0] };
}

function ascii(view: DataView, at: number, length: number) {
  let out = "";
  for (let i = 0; i < length && at + i < view.byteLength; i++)
    out += String.fromCharCode(view.getUint8(at + i));
  return out;
}

/** '2023:07:10 20:12:00' → '2023-07-10T20:12:00'. EXIF 의 시각은 찍은 곳의 시계 그대로다. */
function parseExifDate(text?: string) {
  const m = text?.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return undefined;
  const [, y, mo, d, h, mi, s] = m;
  if (`${y}${mo}${d}` === "00000000") return undefined; // 시각을 비워 둔 사진
  return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

/** 도·분·초와 N/S/E/W 를 십진 좌표로 — [37, 33, 55.2], 'N' → 37.5653 */
function degrees(dms?: number[], ref?: string) {
  if (!dms || dms.length < 3) return undefined;
  const [d, m, s] = dms;
  const value = d + m / 60 + s / 3600;
  if (!Number.isFinite(value)) return undefined;
  return ref === "S" || ref === "W" ? -value : value;
}
