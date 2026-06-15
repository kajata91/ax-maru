# memory.md — AX-Maru 진행상황 로그

이 파일은 프로젝트의 주요 진행상황을 **시간순으로** 누적 기록한다.
작업이 끝날 때마다 맨 아래에 `## YYYY-MM-DD` 항목으로 무엇을·왜·어떻게 했는지 한 줄씩 남긴다.
(상세 기능 정의는 `AX-Maru 기능 정의.md`, 작업 규칙은 `CLAUDE.md` 참고)

---

## 2026-06-15

- **GitHub 연동 구축**: 로컬 폴더(`.../20. AI Project/AX-Maru`)를 git 저장소로 초기화하고 `git@github.com:kajata91/ax-maru.git`(main)에 연결. SSH 키 인증 설정. 작업물 전체를 첫 커밋으로 업로드.
- **커밋·푸시 스킬 `/ax-push` 생성**: 변경분을 한 번에 자동 커밋·푸시하는 스킬 추가.
- **프로젝트 문서화**: `CLAUDE.md`(작업 가이드)와 `memory.md`(진행 로그) 신설. 핵심 기능 변화는 README에, 진행상황은 memory.md에 기록하는 규칙 수립.

- **CLAUDE.md 전면 보강**: MVP 설정(운영 단계, 일일 6단계 절차, 6분야 명칭 매핑, Tier-1 소스, 수집·제공 규칙, 출력 형식)을 정확히 반영. 기능 정의서(새 명칭)와 소스·주제 정의서(옛 명칭)의 분야명 불일치를 문서화 — 작업은 새 명칭 기준으로 통일하기로.

- **6/15 다이제스트 생성**: `Daily/AX-Maru_Daily_2026-06-15.md` + `site/data/2026-06-15.json` 신규, `index.json` 갱신. 총 13건(Hot5/HR3/Research2/Learning2/Wise1). 톱3: 올트먼 방한 연기 / G7 AI 주권 갈등 / 버신 'HR 2030 애자익 HR'. 신규 프런티어 모델 발표 공백기라 IPO·정책·엔터프라이즈 기능 중심으로 구성.
- **명칭 불일치 해소**: `AX-Maru_소스_주제_정의서.md`를 새 명칭(Total Asset/AI/AX Hot News/HR AX Perspective/Research & Books/Learning/Wise Saying) 기준으로 통일(v0.3). Learning(동영상)·Wise Saying(명언)은 내용 재정의 반영. 남은 결정: Learning 채널 화이트리스트, Wise Saying의 출처·날짜 예외 여부.
- **2단계 자동화 설계 문서 신설**: `AX-Maru_자동화_2단계_설계.md` 작성. 권고 아키텍처 = 클라우드 스케줄 실행 + JSON SSOT + git 경유 동기화 + GitHub Pages + Gmail SMTP + verify.mjs 품질 가드.
- **scripts/ 점검**: 현재 `package.json`만 존재(진입점 `curate.mjs` 부재 → `npm run curate` 실패). 민감정보 없음. 2단계 진입 전 `.gitignore`에 `node_modules/`·`.env` 등 추가 필요.

## (이전 작업 — 일자별 수집 기록)

- 2026-06-13: `Daily/AX-Maru_Daily_2026-06-13.md` 수집 기록, `site/data/2026-06-13.json`
- 2026-06-12: `Daily/AX-Maru_Daily_2026-06-12.md` 수집 기록, `site/data/2026-06-12.json`, 대시보드·기능 정의서·MVP 실행가이드·정보원 100선/50선 작성
