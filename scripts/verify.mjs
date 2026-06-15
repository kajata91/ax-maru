// AX-Maru 무료 품질 가드 + 이메일 렌더러 (순수 Node, 외부 의존성 없음)
// 하는 일: ① JSON 무결성 검증 ② 날짜 간 중복 탐지 ③ 링크 도달성·필드 일치 점검
//          ④ 6개 분야 커버리지 리포트 ⑤ 통과 시 이메일 HTML 생성(요약+설명+링크)
// 실패 안전장치: 구조적 오류(스키마 위반)는 비-0 종료 → 워크플로가 배포를 막는다.
//               링크 도달 실패는 경고만(외부 사이트 봇 차단 오탐 방지) → 배포는 진행.
//
// 사용:  node scripts/verify.mjs [--emit-email scripts/out/email.html] [--date YYYY-MM-DD]
//
// 주의: 요약이 원문 내용과 '의미상' 일치하는지의 심층 검증은 LLM이 필요(유료)하므로
//       여기서는 하지 않는다. 구조적 점검(링크 살아있음·출처/요약 필드 존재·길이)만 무료로 수행.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "site", "data");
const CATS = ["hot", "hr", "research", "learning", "wise"]; // total은 집계 뷰(항목 cat 아님)
const CAT_LABEL = { hot: "AI/AX Hot News", hr: "HR AX Perspective", research: "Research & Books", learning: "Learning", wise: "Wise Saying" };
const IMP = ["상", "중", "하"];
const SUMMARY_MAX = 1000; // 요약+시사점 합산 권고 상한

const args = process.argv.slice(2);
const getArg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const emitEmail = getArg("--emit-email");

const errors = [];   // 하드 실패 → 배포 차단
const warns = [];    // 경고 → 배포 진행
const E = (m) => errors.push(m);
const W = (m) => warns.push(m);

function readJSON(p) { return JSON.parse(readFileSync(p, "utf8")); }

// --- 1) index.json 로드 & 날짜 목록 ---
const indexPath = join(DATA, "index.json");
if (!existsSync(indexPath)) { console.error("✗ index.json 없음"); process.exit(1); }
const index = readJSON(indexPath);
const dates = Array.isArray(index.dates) ? [...index.dates].sort() : [];
if (!dates.length) { console.error("✗ index.json에 날짜가 없음"); process.exit(1); }
const newest = getArg("--date") || dates[dates.length - 1];

// --- 2) 각 날짜 JSON 스키마 검증 + 중복 수집 ---
const seenUrls = new Map(); // url -> [날짜...]  (날짜 간 중복 탐지용)
const byDate = {};
for (const d of dates) {
  const p = join(DATA, `${d}.json`);
  if (!existsSync(p)) { E(`${d}.json 파일이 index에는 있으나 실제로 없음`); continue; }
  let doc;
  try { doc = readJSON(p); } catch (e) { E(`${d}.json JSON 파싱 실패: ${e.message}`); continue; }
  byDate[d] = doc;

  if (!doc.date) W(`${d}: date 필드 비어있음`);
  if (!Array.isArray(doc.keywords) || doc.keywords.length === 0) W(`${d}: keywords(이번 주 키워드) 비어있음`);
  if (!Array.isArray(doc.items)) { E(`${d}: items 배열 없음`); continue; }
  if (doc.items.length > 20) W(`${d}: 항목 ${doc.items.length}건 — 하루 20건 이내 권고 초과`);

  doc.items.forEach((it, i) => {
    const at = `${d}#${i + 1}`;
    if (!IMP.includes(it.imp)) E(`${at}: imp '${it.imp}' 잘못됨(상/중/하)`);
    if (!CATS.includes(it.cat)) E(`${at}: cat '${it.cat}' 잘못됨(${CATS.join("/")})`);
    if (!it.title?.trim()) E(`${at}: title 비어있음`);
    if (!it.summary?.trim()) E(`${at}: summary(설명) 비어있음`);
    else if (it.summary.length + (it.insight?.length || 0) > SUMMARY_MAX) W(`${at}: 요약+시사점 ${it.summary.length + (it.insight?.length || 0)}자 — 1,000자 권고 초과`);
    if (!it.insight?.trim()) W(`${at}: insight(시사점) 비어있음`);
    if (!it.source?.trim()) E(`${at}: source(출처) 비어있음`);
    if (!/^https?:\/\//.test(it.url || "")) E(`${at}: url 형식 오류('${it.url}')`);
    else { const list = seenUrls.get(it.url) || []; list.push(d); seenUrls.set(it.url, list); }
  });
}

// --- 3) 날짜 간 중복 제거(탐지) ---
for (const [url, ds] of seenUrls) if (ds.length > 1) W(`날짜 간 중복 링크: ${url} → ${ds.join(", ")}`);

// --- 4) 최신 날짜 6개 분야 커버리지 ---
const newestDoc = byDate[newest];
if (newestDoc?.items) {
  const present = new Set(newestDoc.items.map((i) => i.cat));
  const missing = CATS.filter((c) => !present.has(c));
  if (missing.length) W(`${newest}: 비어있는 분야 ${missing.map((c) => CAT_LABEL[c]).join(", ")} (6개 분야 매일 채우기 목표)`);
}

// --- 5) 링크 도달성 점검 (최신 날짜만, 경고 처리) ---
async function checkLink(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 AX-Maru-LinkCheck" } });
    clearTimeout(t);
    return res.status;
  } catch { return 0; }
}

let linkOk = 0, linkTotal = 0;
if (newestDoc?.items) {
  const results = await Promise.all(newestDoc.items.map(async (it) => ({ it, status: await checkLink(it.url) })));
  for (const { it, status } of results) {
    linkTotal++;
    if (status >= 200 && status < 400) linkOk++;
    else W(`${newest}: 링크 응답 ${status || "실패"} — ${it.title} (${it.url})`);
  }
}

// --- 결과 출력 ---
console.log(`\n=== AX-Maru 품질 가드 (최신: ${newest}) ===`);
console.log(`날짜 ${dates.length}개 · 최신 ${newestDoc?.items?.length || 0}건 · 링크 점검 ${linkOk}/${linkTotal} 정상`);
if (warns.length) { console.log(`\n⚠️  경고 ${warns.length}건 (배포는 진행):`); warns.forEach((w) => console.log("  - " + w)); }
if (errors.length) { console.log(`\n✗ 오류 ${errors.length}건 (배포 차단):`); errors.forEach((e) => console.log("  - " + e)); }
else console.log("\n✓ 구조 검증 통과");

// --- 6) 이메일 HTML 생성 (통과 시) ---
if (emitEmail && newestDoc && !errors.length) {
  const esc = (s) => String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const impColor = { 상: "#ef4444", 중: "#f59e0b", 하: "#9ca3af" };
  const cards = newestDoc.items.map((it) => `
    <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin:12px 0;">
      <div style="font-size:12px;color:#6b7280;">
        <span style="background:${impColor[it.imp] || "#9ca3af"};color:#fff;border-radius:5px;padding:1px 7px;font-weight:700;">${esc(it.imp)}</span>
        &nbsp;${esc(CAT_LABEL[it.cat] || it.cat)} · ${esc(it.source)} · ${esc(it.date)}
      </div>
      <div style="font-size:15px;font-weight:700;margin:8px 0 6px;">${esc(it.title)}</div>
      <div style="font-size:13.5px;line-height:1.6;color:#374151;">${esc(it.summary)}</div>
      ${it.insight ? `<div style="font-size:13px;line-height:1.6;color:#1f2937;margin-top:6px;">💡 ${esc(it.insight)}</div>` : ""}
      <div style="margin-top:8px;"><a href="${esc(it.url)}" style="font-size:13px;color:#2563eb;">🔗 원문 보기</a></div>
    </div>`).join("");

  const html = `<!doctype html><html><body style="font-family:Apple SD Gothic Neo,Pretendard,sans-serif;max-width:680px;margin:0 auto;padding:16px;color:#111;">
    <h2 style="margin:0 0 4px;">AX-Maru Daily — ${esc(newestDoc.date)}</h2>
    <div style="font-size:13px;color:#6b7280;">총 ${newestDoc.items.length}건 · 이번 주 키워드: ${(newestDoc.keywords || []).map(esc).join(" · ")}</div>
    <div style="font-size:12px;color:#16a34a;margin-top:4px;">✅ 링크 점검: ${linkOk}/${linkTotal} 정상${warns.length ? ` · ⚠️ 경고 ${warns.length}건(로그 확인)` : ""}</div>
    ${cards}
    <div style="font-size:12px;color:#9ca3af;margin-top:16px;border-top:1px solid #eee;padding-top:10px;">
      각 항목의 설명은 원문 요약이며, 위 링크로 원문을 확인할 수 있습니다. 자동 발송 · AX-Maru</div>
  </body></html>`;

  mkdirSync(dirname(join(ROOT, emitEmail)), { recursive: true });
  writeFileSync(join(ROOT, emitEmail), html, "utf8");
  // 이메일 제목용 메타도 함께 출력(워크플로가 읽어감)
  writeFileSync(join(ROOT, dirname(emitEmail), "email-subject.txt"), `AX-Maru Daily — ${newestDoc.date} (총 ${newestDoc.items.length}건)`, "utf8");
  console.log(`\n✉️  이메일 HTML 생성: ${emitEmail}`);
}

process.exit(errors.length ? 1 : 0);
