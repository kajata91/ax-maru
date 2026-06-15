# CLAUDE.md — AX-Maru 프로젝트 가이드

이 파일은 Claude(및 협업자)가 AX-Maru 프로젝트를 다룰 때 참고하는 기준 문서다.
작업 전 이 문서를 읽고, 작업 후에는 아래 **작업 규칙**에 따라 README와 memory.md를 갱신한다.

## 프로젝트 개요

AX-Maru: AI와 AX(AI Experience) 관련 인사이트를 가장 빠르고 깊게 수집·축적·제공하는 정보 허브.
Obsidian 기반으로 자료를 관리하고, `site/`에 프론트(대시보드)를 두며, GitHub로 버전 관리한다.

## 핵심 기능 (6개 섹션)

기능 정의서: `AX-Maru 기능 정의.md`

| # | 명칭 | 내용 |
|---|------|------|
| 1 | **Total Asset** | 현재까지 찾고 축적한 자료 전체 제시 |
| 2 | **AI/AX Hot News** | 모델 업그레이드·신개념·뉴스·차트·순위 (글로벌 정보원 100선 기반) |
| 3 | **HR AX Perspective** | HR 분야 AX 도입 사례 (HR 통합 정보원 50선 기반) |
| 4 | **Research & Books** | AI/AX 베스트셀러·최신 도서·연구 자료 (50선·100선 + Amazon) |
| 5 | **Learning** | 기관·유튜브의 최신·인기 동영상 링크 |
| 6 | **Wise Saying** | AI/AX·변화·혁신 관련 경영자·학자의 명언 |

**공통 규칙: 모든 기능은 2025년 1월 1일 이후 자료만 탐색·축적한다.** 최신성·조회수 기준으로 우선순위를 둔다.

## 저장소 구조

```
AX-Maru/
├─ CLAUDE.md                      # 이 가이드 문서
├─ memory.md                      # 진행상황 로그 (시간순)
├─ README.md                      # 프로젝트 소개 + 핵심 기능 변화 기록
├─ AX-Maru 기능 정의.md            # 6개 섹션 기능 정의서 (원천 사양)
├─ AX-Maru_MVP_실행가이드.md
├─ AX-Maru_소스_주제_정의서.md
├─ AI_AX_글로벌_정보원_100선.md
├─ AI_AX_HR_통합_정보원_50선.md
├─ AX-Maru_Dashboard.html         # 대시보드 (단독 HTML)
├─ Daily/                         # 일자별 수집 기록 (AX-Maru_Daily_YYYY-MM-DD.md)
├─ Archive/                       # 보관용
└─ site/                          # 프론트엔드
   ├─ index.html
   └─ data/                       # 채널·일자별 JSON 데이터
```

## 작업 규칙 (중요)

1. **핵심 기능 변화는 README.md에 기록한다.** 새 기능 추가·기능명 변경·동작 방식 변경 등 사용자에게 의미 있는 변화가 생기면 README의 변경 이력에 한 줄 남긴다.
2. **모든 작업 진행상황은 memory.md에 시간순으로 누적한다.** 무엇을, 왜, 어떻게 했는지 한 줄씩 기록해 맥락이 누락되거나 헷갈리지 않게 한다.
3. **커밋·푸시는 `/ax-push` 스킬로 한다.** (변경분 자동 커밋 후 GitHub `main`에 푸시)

## Git / 배포

- 원격: `git@github.com:kajata91/ax-maru.git` (main 브랜치, SSH 인증)
- 커밋·푸시 스킬: `/ax-push ["커밋 메시지"]`
- `.DS_Store`는 `.gitignore`로 제외
