/**
 * File System Access API — 데스크톱 크로미움 계열에만 있다.
 * 다운로드 폴더에서 파일 선택기를 여는 데만 쓰므로 필요한 만큼만 선언한다.
 */
interface DasiBomFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  /** 선택기가 처음 여는 위치 */
  startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";
  types?: { description?: string; accept: Record<string, string[]> }[];
}

interface DasiBomFileHandle {
  getFile(): Promise<File>;
}

interface Window {
  showOpenFilePicker?: (options?: DasiBomFilePickerOptions) => Promise<DasiBomFileHandle[]>;
}
