import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";

type Screen = "home" | "create" | "detail" | "interview" | "voice" | "story" | "invite" | "upload" | "notices" | "profile" | "guest" | "guestInfo" | "guestAnswer" | "guestDone";
type Tab = "사진" | "목소리" | "이야기" | "연대표";
type Go = (screen: Screen) => void;

const photos = [
  { src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85", title: "파리에 도착한 첫날", date: "2023. 07. 10", place: "Paris, France", status: "이야기 완성" },
  { src: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85", title: "다 함께한 저녁 식사", date: "2023. 07. 11", place: "Paris, France", status: "답변 기다리는 중" },
  { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85", title: "여행의 마지막 날", date: "2023. 07. 17", place: "Rome, Italy", status: "AI 정리 중" },
];

function Topbar({ back, title, action, go }: { back?: () => void; title?: string; action?: ReactNode; go?: Go }) {
  return <header className="topbar">
    {back ? <button type="button" className="icon-button" onClick={back} aria-label="뒤로가기">←</button> : <button type="button" className="brand" onClick={() => go?.("home")} aria-label="다시, 봄 홈"><i>다시,</i> 봄</button>}
    {title && <strong className="top-title">{title}</strong>}
    {action ?? (!back ? <button type="button" className="avatar" onClick={() => go?.("profile")} aria-label="프로필 열기">하</button> : <span className="header-spacer" />)}
  </header>;
}

function BottomNav({ go }: { go: Go }) {
  return <nav className="bottom-nav" aria-label="주요 메뉴">
    <button type="button" className="active" onClick={() => go("home")}><span>▣</span>기록</button>
    <button type="button" onClick={() => go("invite")}><span>♧</span>초대</button>
    <button type="button" className="nav-create" onClick={() => go("create")} aria-label="새 기록 만들기">＋</button>
    <button type="button" onClick={() => go("notices")}><span>♢</span>알림<i>2</i></button>
    <button type="button" onClick={() => go("profile")}><span>○</span>나</button>
  </nav>;
}

function HomeScreen({ go, title, notify }: { go: Go; title: string; notify: (text: string) => void }) {
  const [recent, setRecent] = useState(true);
  return <>
    <Topbar go={go} />
    <div className="welcome"><p>안녕하세요, 하연님</p><h1>함께 기억하고 싶은<br />순간이 있나요?</h1></div>
    <button type="button" className="new-record" onClick={() => go("create")}><span className="plus">＋</span><span><b>새 기록 만들기</b><small>사진 한 장에서 시작해보세요</small></span><span className="arrow">→</span></button>
    <div className="section-heading"><h2>내 기록</h2><button type="button" onClick={() => { setRecent(!recent); notify(recent ? "오래된 기록부터 정렬했어요" : "최근 수정한 기록부터 정렬했어요"); }}>{recent ? "최근 수정순" : "오래된 순"}⌄</button></div>
    <article className="record-card" onClick={() => go("detail")} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && go("detail")}>
      <div className="cover-wrap"><img src={photos[0].src} alt="파리 에펠탑 풍경" /><span className="status">기록 수집 중</span></div>
      <div className="record-body"><div className="record-title-row"><div><h3>{title}</h3><p>2023. 07. 10 — 07. 17</p></div><button type="button" aria-label="기록 더보기" onClick={(e) => { e.stopPropagation(); notify("기록 메뉴: 이름 수정 · 공유 · 삭제"); }}>•••</button></div><div className="progress-line"><span /></div><div className="record-meta"><span><b>70%</b> 완성</span><span>사진 3 · 목소리 4</span></div></div>
    </article>
    <div className="small-note"><span>✦</span><p><b>오늘의 기록 팁</b><br />사진 속 표정보다 그날의 기분을 먼저 물어보세요.</p></div>
    <BottomNav go={go} />
  </>;
}

function CreateScreen({ go, onCreate, notify }: { go: Go; onCreate: (title: string) => void; notify: (text: string) => void }) {
  const [title, setTitle] = useState("");
  const [ready, setReady] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  function chooseFile(file?: File) { if (!file) return; if (!file.type.startsWith("image/")) return notify("이미지 파일만 선택해주세요"); const reader = new FileReader(); reader.onload = () => setCover(String(reader.result)); reader.readAsDataURL(file); }
  function submit(e: FormEvent) { e.preventDefault(); if (!title.trim()) return; setReady(true); onCreate(title.trim()); setTimeout(() => go("detail"), 500); }
  return <><Topbar back={() => go("home")} title="새 기록 만들기" /><div className="create-intro"><span>01</span><h1>어떤 순간을<br />기록해볼까요?</h1><p>기억하기 쉬운 이름을 붙여주세요.<br />사진과 이야기는 나중에도 추가할 수 있어요.</p></div>
    <form className="record-form" onSubmit={submit}>
      <label>기록 제목<span>필수</span><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 2023년 유럽여행" /></label>
      <div className="date-grid"><label>시작일<input type="date" defaultValue="2023-07-10" /></label><label>종료일<input type="date" defaultValue="2023-07-17" /></label></div>
      <label>짧은 설명<textarea defaultValue="가족들과 처음 떠난 유럽여행의 사진과 이야기를 기록합니다." /></label>
      <label className="cover-upload">{cover ? <img src={cover} alt="대표 사진 미리보기" /> : <span>＋</span>}<b>{cover ? "대표 사진 변경" : "대표 사진 추가"}</b><small>JPG, PNG · 최대 10MB</small><input className="visually-hidden" type="file" accept="image/*" onChange={(e) => chooseFile(e.target.files?.[0])} /></label>
      <button className="primary wide" disabled={!title.trim() || ready}>{ready ? "기록을 만들고 있어요…" : "기록 만들기"}</button>
    </form>
  </>;
}

function DetailScreen({ go, title, notify }: { go: Go; title: string; notify: (text: string) => void }) {
  const [tab, setTab] = useState<Tab>("사진");
  const [sorted, setSorted] = useState(false);
  return <>
    <Topbar back={() => go("home")} action={<button type="button" className="text-button" onClick={() => go("invite")}>가족 초대</button>} />
    <section className="detail-hero"><img src={photos[0].src} alt="에펠탑을 바라보는 여행 풍경" /><div className="hero-overlay"><p>2023. 07. 10 — 07. 17</p><h1>{title.includes(" ") ? <>{title.split(" ")[0]}<br />{title.split(" ").slice(1).join(" ")}</> : title}</h1><div className="people"><span>하</span><span>엄</span><span>아</span><b>+1</b></div></div></section>
    <section className="summary-card"><div><span className="ring">70<small>%</small></span></div><p><b>조금만 더 이야기해주세요</b><br /><span>사진 1장의 답변을 기다리고 있어요.</span></p><button type="button" onClick={() => go("interview")}>이어하기</button></section>
    <div className="tabs" role="tablist">{(["사진","목소리","이야기","연대표"] as Tab[]).map((item) => <button type="button" role="tab" aria-selected={tab === item} key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === "사진" && <PhotoTab go={go} sorted={sorted} onSort={() => { setSorted(!sorted); notify(sorted ? "촬영일 순으로 정렬했어요" : "진행 상태 순으로 정렬했어요"); }} />}
    {tab === "목소리" && <VoiceTab notify={notify} />}
    {tab === "이야기" && <StoryTab go={go} />}
    {tab === "연대표" && <TimelineTab go={go} />}
    <button type="button" className="floating-add" onClick={() => go("upload")}><span>＋</span> 사진 추가</button>
  </>;
}

function PhotoTab({ go, sorted, onSort }: { go: Go; sorted: boolean; onSort: () => void }) {
  const list = sorted ? [...photos].reverse() : photos;
  return <section className="tab-content"><div className="content-heading"><p><b>사진 3장</b><span>사진을 눌러 이야기를 이어가세요</span></p><button type="button" onClick={onSort}>{sorted ? "진행 상태순" : "촬영일순"}⌄</button></div><div className="photo-grid">{list.map((photo) => { const index = photos.indexOf(photo); return <button type="button" className="photo-tile" key={photo.title} onClick={() => go(index === 0 ? "story" : "interview")}><img src={photo.src} alt={photo.title} /><span className={`photo-state s${index}`}>{index === 0 ? "✓" : index === 1 ? "2개 질문" : "···"}</span><div><b>{photo.title}</b><small>{photo.status}</small></div></button>; })}</div></section>;
}

function VoiceTab({ notify }: { notify: (text: string) => void }) {
  const [playing, setPlaying] = useState<number | null>(null);
  function toggle(i: number, name: string) { const next = playing === i ? null : i; setPlaying(next); notify(next === null ? "재생을 멈췄어요" : `${name}의 목소리를 재생합니다`); }
  return <section className="tab-content"><div className="content-heading"><p><b>가족의 목소리 4개</b><span>그날의 온도가 담긴 이야기</span></p></div>{["엄마", "아버지", "나"].map((name, i) => <article className="voice-row" key={name}><button type="button" onClick={() => toggle(i, name)} aria-label={`${name} 목소리 ${playing === i ? "일시정지" : "재생"}`}>{playing === i ? "Ⅱ" : "▶"}</button><div><b>{name}의 목소리</b><span>{i === 0 ? "파리에 도착한 첫날" : i === 1 ? "다 함께한 저녁 식사" : "여행의 마지막 날"}</span></div><time>0:{24 + i * 13}</time></article>)}</section>;
}

function StoryTab({ go }: { go: Go }) { return <section className="tab-content"><div className="content-heading"><p><b>완성된 이야기 2편</b><span>AI가 가족의 답변을 정리했어요</span></p></div><button type="button" className="story-preview" onClick={() => go("story")}><img src={photos[0].src} alt="에펠탑" /><span><small>2023. 07. 10 · 파리</small><b>파리에 도착한 첫날</b><p>긴 이동 끝에 도착한 가족들은 함께 저녁을 먹으며 여행의 시작을 기념했습니다.</p></span></button></section>; }
function TimelineTab({ go }: { go: Go }) { return <section className="tab-content timeline"><div className="content-heading"><p><b>우리 여행 연대표</b><span>이야기가 시간순으로 정리됐어요</span></p></div>{photos.map((photo, i) => <button type="button" key={photo.title} onClick={() => go(i === 0 ? "story" : "interview")}><time>{photo.date.replace("2023. ", "")}</time><span className="dot" /><img src={photo.src} alt="" /><div><b>{photo.title}</b><small>{photo.place}</small></div></button>)}</section>; }

function InterviewScreen({ go, notify }: { go: Go; notify: (text: string) => void }) {
  const [question, setQuestion] = useState(0); const [textMode, setTextMode] = useState(false); const [answer, setAnswer] = useState("");
  const questions = ["이 사진은 여행 중 언제, 어디에서 찍은 사진인가요?", "그날 가장 기억에 남는 대화는 무엇이었나요?", "이 순간을 한 문장으로 남긴다면요?"];
  function submit() { if (!answer.trim()) return; if (question < 2) { setQuestion(question + 1); setAnswer(""); setTextMode(false); notify("답변을 저장하고 다음 질문을 만들었어요"); } else { notify("사진 이야기가 완성됐어요"); go("story"); } }
  return <><Topbar back={() => go("detail")} title="사진 이야기 남기기" action={<button type="button" className="text-button" onClick={() => go("detail")}>나가기</button>} /><div className="step-progress"><span style={{width: `${33 + question * 33}%`}} /><small>{question + 1} / 3</small></div><div className="interview-photo"><img src={photos[1].src} alt="가족 저녁 식사" /><span>2023. 07. 11 · 파리</span></div>
    <section className="question-card"><div className="ai-badge">✦</div><p>AI가 사진을 보고 물어봐요</p><h1>{questions[question]}</h1>{question > 0 && <div className="previous-answer"><small>이전 답변</small>“파리에 도착한 다음 날, 가족들과 작은 식당에서 저녁을 먹었어요.”</div>}</section>
    {!textMode ? <div className="answer-actions"><button type="button" className="voice-answer" onClick={() => go("voice")}><span>●</span><b>목소리로 답하기</b><small>실제로 녹음해 남겨보세요</small></button><button type="button" className="text-answer" onClick={() => setTextMode(true)}><span>가</span><b>글로 답하기</b><small>차분히 써서 남겨보세요</small></button></div> : <div className="text-entry"><textarea autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="사진을 보며 떠오르는 이야기를 들려주세요." /><small>{answer.length} / 500</small><button type="button" className="primary wide" disabled={!answer.trim()} onClick={submit}>{question === 2 ? "이야기 완성하기" : "답변 남기기"}</button></div>}
    <button type="button" className="skip-button" onClick={() => question < 2 ? setQuestion(question + 1) : go("detail")}>이 질문은 건너뛸게요</button>
  </>;
}

function VoiceScreen({ go, notify }: { go: Go; notify: (text: string) => void }) {
  const [recording, setRecording] = useState(false); const [seconds, setSeconds] = useState(0); const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null); const stream = useRef<MediaStream | null>(null); const chunks = useRef<Blob[]>([]);
  useEffect(() => { if (!recording) return; const id = setInterval(() => setSeconds((s) => s + 1), 1000); return () => clearInterval(id); }, [recording]);
  useEffect(() => () => { stream.current?.getTracks().forEach((track) => track.stop()); }, []);
  async function start() { try { const live = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.current = live; chunks.current = []; const media = new MediaRecorder(live); recorder.current = media; media.ondataavailable = (e) => e.data.size && chunks.current.push(e.data); media.onstop = () => { setAudioUrl(URL.createObjectURL(new Blob(chunks.current, { type: media.mimeType }))); live.getTracks().forEach((track) => track.stop()); }; media.start(); setRecording(true); setSeconds(0); } catch { notify("마이크 권한을 허용하거나 글로 답해주세요"); } }
  function stop() { recorder.current?.stop(); setRecording(false); }
  function reset() { if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(null); setSeconds(0); }
  return <><Topbar back={() => go("interview")} title="목소리로 답하기" /><div className="voice-photo"><img src={photos[1].src} alt="가족 저녁 식사" /></div><section className="voice-question"><span>AI 질문</span><h1>이 사진은 여행 중 언제, 어디에서 찍은 사진인가요?</h1></section>
    <div className={`recorder ${recording ? "recording" : ""}`}><div className="wave">{Array.from({length: 24}).map((_, i) => <i key={i} style={{height: `${10 + ((i * 13) % 34)}px`}} />)}</div><time>{String(Math.floor(seconds / 60)).padStart(2,"0")}:{String(seconds % 60).padStart(2,"0")}</time><p>{audioUrl ? "녹음이 완료됐어요" : recording ? "듣고 있어요. 편하게 이야기해주세요." : "버튼을 누르면 실제 녹음이 시작돼요"}</p>{audioUrl ? <audio className="audio-player" src={audioUrl} controls /> : <button type="button" className="record-button" onClick={recording ? stop : start}>{recording ? "■" : "●"}</button>}<small>{audioUrl ? "재생해 확인한 뒤 목소리를 남겨주세요" : "최대 5분까지 녹음할 수 있어요"}</small></div>
    {audioUrl ? <div className="voice-done-actions"><button type="button" onClick={reset}>다시 녹음</button><button type="button" className="primary" onClick={() => { notify("목소리를 안전하게 저장했어요"); go("story"); }}>이 목소리 남기기</button></div> : !recording && <button type="button" className="skip-button" onClick={() => go("interview")}>글로 답하기</button>}
  </>;
}

function StoryScreen({ go, notify }: { go: Go; notify: (text: string) => void }) {
  const [editing, setEditing] = useState(false); const [playing, setPlaying] = useState(false); const [style, setStyle] = useState("따뜻하게");
  return <><Topbar back={() => go("detail")} title="사진 이야기" action={<button type="button" className="text-button" onClick={() => setEditing(!editing)}>{editing ? "취소" : "수정"}</button>} /><article className="story-page"><div className="story-image"><img src={photos[0].src} alt="파리 에펠탑" /><span>1 / 3</span></div><div className="story-kicker"><span>2023년 7월 10일</span><i /><span>Paris, France</span></div>{editing ? <><input className="story-title-input" defaultValue="파리에 도착한 첫날" /><div className="style-picker">{["따뜻하게","담백하게","회고록처럼"].map((item) => <button type="button" className={style === item ? "active" : ""} onClick={() => setStyle(item)} key={item}>{item}</button>)}</div></> : <h1>파리에 도착한<br />첫날</h1>}<div className="story-tags"><span>아버지</span><span>어머니</span><span>하연</span><span>설렘</span></div>{editing ? <textarea className="story-body-input" defaultValue="긴 이동 끝에 파리에 도착한 가족들은 첫날 저녁을 함께 먹으며 여행의 시작을 기념했습니다. 모두 피곤했지만, 창밖으로 에펠탑이 보이던 순간만큼은 말없이 한참을 바라보았습니다." /> : <p className="story-copy">긴 이동 끝에 파리에 도착한 가족들은 첫날 저녁을 함께 먹으며 여행의 시작을 기념했습니다.<br /><br />모두 피곤했지만, 창밖으로 에펠탑이 보이던 순간만큼은 말없이 한참을 바라보았습니다. 엄마는 그때의 우리 표정이 아직도 생생하다고 말합니다.</p>}<div className="quote"><span>“</span><p>다 같이 너무 피곤했지만<br />정말 행복했어요.</p><small>— 엄마의 답변에서</small></div><button type="button" className="original-voice" onClick={() => { setPlaying(!playing); notify(playing ? "재생을 멈췄어요" : "엄마의 목소리를 재생합니다"); }}><span>{playing ? "Ⅱ" : "▶"}</span><p><b>엄마의 목소리</b><small>0:32 · 원본 음성</small></p><i>•••</i></button><p className="ai-note">✦ 이 이야기는 가족의 답변을 바탕으로 AI가 정리했어요.</p></article>{editing && <button type="button" className="primary sticky-save" onClick={() => { setEditing(false); notify(`${style} 스타일로 이야기를 저장했어요`); }}>이야기 저장하기</button>}</>;
}

async function copyText(text: string) { try { await navigator.clipboard.writeText(text); } catch { const area = document.createElement("textarea"); area.value = text; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove(); } }

function InviteScreen({ go, notify }: { go: Go; notify: (text: string) => void }) {
  const [link, setLink] = useState("초대 링크 준비 중…");
  useEffect(() => setLink(`${window.location.origin}${window.location.pathname}?invite=EU23`), []);
  async function copy() { await copyText(link); notify("실제 가족 참여 링크를 복사했어요"); }
  async function share() { if (navigator.share) { try { await navigator.share({ title: "2023년 유럽여행에 초대해요", text: "사진을 보고 떠오르는 이야기를 들려주세요.", url: link }); } catch { return; } } else await copy(); }
  return <><Topbar back={() => go("detail")} title="가족 초대하기" /><section className="invite-hero"><div className="invite-photos"><img src={photos[0].src} alt="" /><img src={photos[1].src} alt="" /><img src={photos[2].src} alt="" /></div><span>함께 기록하면 더 선명해져요</span><h1>가족의 목소리로<br />빈 이야기를 채워주세요</h1><p>링크를 받은 가족은 회원가입 없이<br />바로 사진을 보고 답할 수 있어요.</p></section>
    <div className="invite-link"><small>가족 참여 링크</small><div><span>{link.replace("https://", "")}</span><button type="button" onClick={copy}>복사</button></div><p>이 링크는 2026년 9월 28일까지 사용할 수 있어요.</p></div>
    <div className="share-buttons"><button type="button" onClick={share}><span>◉</span>공유하기</button><button type="button" onClick={() => { window.location.href = `sms:?&body=${encodeURIComponent(`2023년 유럽여행 기록에 초대해요 ${link}`)}`; }}><span>↗</span>문자로 보내기</button><button type="button" onClick={() => go("guest")}><span>⌁</span>초대 화면 체험</button></div>
    <section className="participants"><div className="content-heading"><p><b>함께하는 가족 3명</b><span>답변이 도착하면 알려드릴게요</span></p></div>{[["엄","엄마","답변 4개","완료"],["아","아버지","답변 2개","참여 중"],["민","동생 민준","아직 답변 없음","초대됨"]].map((p, i) => <button type="button" className="participant" onClick={() => notify(`${p[1]} · ${p[2]}`)} key={p[1]}><span className={`p${i}`}>{p[0]}</span><p><b>{p[1]}</b><small>{p[2]}</small></p><i>{p[3]}</i></button>)}</section>
  </>;
}

function UploadScreen({ go, notify }: { go: Go; notify: (text: string) => void }) {
  const [items, setItems] = useState<string[]>([]);
  function add(files: FileList | null) { if (!files) return; setItems((old) => [...old, ...Array.from(files).filter((f) => f.type.startsWith("image/")).map(URL.createObjectURL)]); }
  return <><Topbar back={() => go("detail")} title="사진 추가하기" /><label className="drop-zone"><span>＋</span><b>사진을 선택해주세요</b><small>JPG, PNG, WebP · 여러 장 선택 가능</small><input className="visually-hidden" type="file" accept="image/*" multiple onChange={(e) => add(e.target.files)} /></label>{items.length > 0 && <div className="upload-grid">{items.map((src, i) => <div key={src}><img src={src} alt={`선택한 사진 ${i + 1}`} /><button type="button" onClick={() => setItems(items.filter((_, n) => n !== i))} aria-label="사진 삭제">×</button><span>업로드 준비</span></div>)}</div>}<button type="button" className="primary wide" disabled={!items.length} onClick={() => { notify(`${items.length}장의 사진을 추가했어요`); go("detail"); }}>사진 업로드 완료</button></>;
}

function GuestWelcome({ go }: { go: Go }) { return <><div className="guest-brand"><i>다시,</i> 봄</div><div className="guest-cover"><img src={photos[0].src} alt="2023년 유럽여행" /><span>하연님이 초대했어요</span></div><section className="guest-copy"><small>가족 기록 초대</small><h1>2023년<br />유럽여행</h1><p>“우리 여행 사진을 보며 기억나는 이야기를 들려주세요. 회원가입 없이 바로 참여할 수 있어요.”</p></section><div className="guest-how"><b>이렇게 참여해요</b><p><span>1</span>사진을 천천히 살펴봐요</p><p><span>2</span>AI 질문에 목소리나 글로 답해요</p><p><span>3</span>가족의 한 편의 이야기로 완성돼요</p></div><button type="button" className="primary wide" onClick={() => go("guestInfo")}>이 기록에 참여하기</button><button type="button" className="skip-button" onClick={() => { window.history.replaceState({}, "", window.location.pathname); go("home"); }}>지금은 참여하지 않을게요</button></>; }

function GuestInfo({ go, notify }: { go: Go; notify: (text: string) => void }) {
  const [name, setName] = useState(""); const [relation, setRelation] = useState(""); const [agree, setAgree] = useState(false);
  return <><Topbar back={() => go("guest")} title="참여자 정보" /><div className="create-intro"><span>01</span><h1>가족에게 나를<br />알려주세요</h1><p>기록에 표시될 이름과 관계를 입력해주세요.</p></div><form className="record-form" onSubmit={(e) => { e.preventDefault(); if (!name || !relation || !agree) return notify("이름·관계·동의를 모두 확인해주세요"); localStorage.setItem("dasiBomGuest", name); go("guestAnswer"); }}><label>닉네임<span>필수</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 엄마" /></label><label>가족 관계<span>필수</span><select value={relation} onChange={(e) => setRelation(e.target.value)}><option value="">관계를 선택해주세요</option><option>어머니</option><option>아버지</option><option>형제·자매</option><option>친척</option></select></label><label className="consent"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />사진·음성·답변 처리에 동의합니다.</label><button className="primary wide">참여 시작하기</button></form></>;
}

function GuestAnswer({ go, notify }: { go: Go; notify: (text: string) => void }) {
  const [answer, setAnswer] = useState(""); const [saved, setSaved] = useState(0);
  return <><Topbar back={() => go("guestInfo")} title="이야기 남기기" /><div className="step-progress"><span style={{width: `${33 + saved * 33}%`}} /><small>{saved + 1} / 3</small></div><div className="interview-photo"><img src={photos[saved].src} alt={photos[saved].title} /><span>{photos[saved].date} · {photos[saved].place}</span></div><section className="question-card"><div className="ai-badge">✦</div><p>이 사진에 대해 궁금해요</p><h1>{saved === 0 ? "이때 가족들은 어떤 기분이었나요?" : saved === 1 ? "이날 기억나는 대화나 음식이 있나요?" : "여행 마지막 날, 가장 아쉬웠던 건 무엇인가요?"}</h1></section><div className="text-entry"><textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="떠오르는 기억을 편하게 남겨주세요." /><small>{answer.length} / 500</small><button type="button" className="primary wide" disabled={!answer.trim()} onClick={() => { if (saved < 2) { setSaved(saved + 1); setAnswer(""); notify("답변을 저장했어요"); } else go("guestDone"); }}>{saved === 2 ? "답변 모두 제출하기" : "답변 저장하고 다음 사진"}</button></div><button type="button" className="skip-button" onClick={() => saved < 2 ? setSaved(saved + 1) : go("guestDone")}>이 사진은 건너뛸게요</button></>;
}

function GuestDone({ go }: { go: Go }) { const name = typeof window !== "undefined" ? localStorage.getItem("dasiBomGuest") || "가족" : "가족"; return <div className="done-screen"><span>✓</span><small>{name}님의 이야기</small><h1>소중한 기억을<br />남겨주셔서 고마워요</h1><p>사진 3장에 남긴 답변이 하연님에게 전달됐어요. AI가 가족의 이야기로 따뜻하게 정리할게요.</p><div><b>답변한 사진</b><strong>3장</strong><b>텍스트 답변</b><strong>2개</strong></div><button type="button" className="primary wide" onClick={() => go("guestAnswer")}>답변 다시 보기</button><button type="button" className="skip-button" onClick={() => { window.history.replaceState({}, "", window.location.pathname); go("home"); }}>참여 마치기</button></div>; }

function Notices({ go }: { go: Go }) { return <><Topbar back={() => go("home")} title="알림" /> <section className="simple-list"><button type="button" onClick={() => go("detail")}><span>엄</span><p><b>엄마가 새 목소리를 남겼어요</b><small>‘파리에 도착한 첫날’ · 방금 전</small></p></button><button type="button" onClick={() => go("story")}><span>✦</span><p><b>새로운 사진 이야기가 완성됐어요</b><small>‘다 함께한 저녁 식사’ · 2시간 전</small></p></button></section></>; }
function Profile({ go, notify }: { go: Go; notify: (text: string) => void }) { const [alert, setAlert] = useState(true); return <><Topbar back={() => go("home")} title="내 설정" /><div className="profile-card"><span>하</span><div><b>하연</b><small>hayun@example.com</small></div><button type="button" onClick={() => notify("프로필 수정 화면을 준비했어요")}>수정</button></div><section className="settings"><button type="button" onClick={() => setAlert(!alert)}><span>가족 답변 알림</span><i className={alert ? "on" : ""}>{alert ? "켜짐" : "꺼짐"}</i></button><button type="button" onClick={() => notify("공유 링크 1개가 활성화되어 있어요")}><span>공유 링크 관리</span><b>›</b></button><button type="button" onClick={() => notify("이용약관을 확인했어요")}><span>이용약관 및 개인정보</span><b>›</b></button><button type="button" onClick={() => { localStorage.removeItem("dasiBomGuest"); notify("로그아웃 처리됐어요"); go("home"); }}><span>로그아웃</span><b>›</b></button></section></>; }

export default function App() {
  const [screen, setScreen] = useState<Screen>("home"); const [title, setTitle] = useState("2023년 유럽여행"); const [toast, setToast] = useState(""); const [ready, setReady] = useState(false);
  useEffect(() => { const params = new URLSearchParams(window.location.search); if (params.get("invite") === "EU23") setScreen("guest"); setReady(true); }, []);
  function notify(text: string) { setToast(text); window.setTimeout(() => setToast(""), 2000); }
  const go: Go = (next) => { setScreen(next); window.scrollTo({top: 0, behavior: "smooth"}); };
  if (!ready) return <main className="app-shell"><section className="phone-canvas boot-screen"><div className="boot-mark"><i>다시,</i> 봄</div><span /><p>가족의 기억을 불러오고 있어요</p></section></main>;
  return <main className="app-shell"><section className={`phone-canvas screen-${screen}`}>
    {screen === "home" && <HomeScreen go={go} title={title} notify={notify} />}
    {screen === "create" && <CreateScreen go={go} onCreate={setTitle} notify={notify} />}
    {screen === "detail" && <DetailScreen go={go} title={title} notify={notify} />}
    {screen === "interview" && <InterviewScreen go={go} notify={notify} />}
    {screen === "voice" && <VoiceScreen go={go} notify={notify} />}
    {screen === "story" && <StoryScreen go={go} notify={notify} />}
    {screen === "invite" && <InviteScreen go={go} notify={notify} />}
    {screen === "upload" && <UploadScreen go={go} notify={notify} />}
    {screen === "notices" && <Notices go={go} />}
    {screen === "profile" && <Profile go={go} notify={notify} />}
    {screen === "guest" && <GuestWelcome go={go} />}
    {screen === "guestInfo" && <GuestInfo go={go} notify={notify} />}
    {screen === "guestAnswer" && <GuestAnswer go={go} notify={notify} />}
    {screen === "guestDone" && <GuestDone go={go} />}
    {toast && <div className="toast" role="status">{toast}</div>}
  </section></main>;
}
