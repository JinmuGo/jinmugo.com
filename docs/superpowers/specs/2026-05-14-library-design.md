# Library — Books, Movies, Music

평생 읽고 보고 들을 것들을 정리해두는 공간. 일반 post와는 다른 첫 번째 destination.

## 한 줄 요약

`/library` 우산 아래 `books`, `movies`, `music` 세 카탈로그. 각 항목은 가볍게 기록만 해도 OK, 깊게 쓰고 싶을 때 정리글로 확장. 인물(저자/감독/아티스트)은 1급 컬렉션으로 분리되어 자체 페이지를 가진다.

## 컨셉

- **카탈로그가 입구.** "내가 뭘 읽고/보고/들었나"가 한눈에. Editorial 리스트(번호 · 작은 표지 · 제목/저자 · 한줄평 · 별점 · 날짜).
- **하이브리드 클릭.** 정리글 있는 항목 → detail 페이지로 이동. 없는 항목 → 그 자리에서 inline 펼치기(메타데이터 + 인용 + 태그).
- **인물 1급.** 저자/감독/아티스트는 자체 페이지(아바타·bio·읽은/본/들은 작품 자동 list·인물에 대한 글 옵션).
- **확장성.** 책/영화/음악만 만들지만 URL·컴포넌트 패턴 통일 → 나중에 TV/podcast 추가 시 복제만.

## 컬렉션 구조

6개 컬렉션. 각각 별도 schema (책·영화·음악 메타데이터가 다르므로 한 컬렉션에 우겨넣지 않음).

### `book`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `title` | string | ✓ | 제목 |
| `authorId` | string | ✓ | `author` 컬렉션 slug 참조 |
| `originalTitle` | string | | 원제 (번역서) |
| `year` | number | ✓ | 출판 연도 |
| `publisher` | string | | |
| `pages` | number | | |
| `language` | enum | | `ko` `en` `ja` ... |
| `cover` | string | | 표지 이미지 경로 |
| `dateRead` | date | | 완독일 (status=reading일 땐 시작일) |
| `rating` | 1..5 | | 별점 |
| `status` | enum | ✓ | `read` (default) · `reading` · `want` |
| `oneLiner` | string | | 카탈로그용 한줄평 |
| `tags` | string[] | | |
| `quote` | string | | 인용 한 문장 (펼침 상태에 표시) |
| `hasEssay` | (자동) | | 본문(body) 길이 > 임계값이면 detail 페이지 활성화 |

본문(body)은 옵션. 있으면 detail 페이지(`/library/books/<slug>`) 활성화. 없으면 catalog에서 inline 펼침.

### `author`

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `name` | string | ✓ | 표시 이름 |
| `originalName` | string | | 원어 이름 |
| `birthYear` | number | | |
| `country` | string | | |
| `bio` | string | | 한줄 bio |
| `photo` | string | | 사진 |
| `wiki` | string | | 외부 링크 |

본문 옵션. 본문이 있으면 인물 페이지의 "이 저자에 대해" 섹션이 활성화.

### `movie`, `director`

`book`/`author`와 동일 패턴. `movie`는 `directorId`, `runtime`, `country`, `releaseYear`. `dateWatched`. status: `watched` · `want`.

### `music`, `artist`

`music` 추가 필드:
- `artistId` — `artist` 참조
- `type` — `album` · `single` · `ep`
- `releaseYear`
- `dateListened`
- `tracks` — 옵션 string[] (앨범 트랙 리스트 표기용)

`status`: `listened` · `want`.

`artist`: `author`와 동일 패턴.

## URL 구조

```
/library                          # Hub 랜딩 (3 type 미리보기)
/library/books                    # 책 카탈로그
/library/books/<book-slug>        # 책 정리글 (본문 있을 때만)
/library/books/author/<author-slug>
/library/movies
/library/movies/<movie-slug>
/library/movies/director/<director-slug>
/library/music
/library/music/<music-slug>
/library/music/artist/<artist-slug>

# 영문 미러
/en/library/...
```

`<book-slug>` 등은 본문 있는 항목만 정적 라우트로 생성(`hasEssay` 자동 판정). 본문 없는 항목 클릭은 카탈로그 위에서 inline 펼침으로 처리.

## 페이지 디자인

### `/library` — Hub

3개 섹션 세로 배치. 각 섹션:
- 섹션 헤더: "Recently Read" / "Recently Watched" / "Recently Listened" + 카탈로그 전체 보기 링크
- 최근 6개 항목을 작은 카드로 (표지 + 제목 + 별점)
- 모바일은 가로 스크롤

### `/library/books` (그리고 movies, music) — Editorial 리스트

```
┌────────────────────────────────────────────────┐
│  Books                                          │
│  전체 24권 · 정리글 6편                          │
│                                                 │
│  [필터 chips: 전체 · ★★★★+ · 2026 · Want]       │
│                                                 │
│  001  📖  사피엔스                ★★★★★  ✎       │
│            유발 하라리 · 2011    2026.03         │
│            "인류가 다른 동물과 다른 이유는…"     │
│  ───────────────────────────────────────────    │
│  002  📖  Process Economy        ★★★★   ✎       │
│            Ozan Varol · 2023    2025.11          │
│            결과보다 과정 자체를 콘텐츠로…        │
│  ───────────────────────────────────────────    │
│  003  📖  Where Are We Now       ★★★★★            │
│            Glen David Gold · 2018  2026.01       │
│            정리는 못 했는데 인용하고 싶은…       │
│   (클릭 시 inline 펼치기)                         │
│   ╔═══════════════════════════════════════════╗ │
│   ║ READ        PUBLISHER     STATUS LANGUAGE  ║ │
│   ║ 2026.01–02  Knopf · 384p  읽음   English   ║ │
│   ║                                             ║ │
│   ║ NOTE                                        ║ │
│   ║ │ "We are always somewhere, even when…"     ║ │
│   ║                                             ║ │
│   ║ TAGS  [memoir] [essay] [place]              ║ │
│   ╚═══════════════════════════════════════════╝ │
└────────────────────────────────────────────────┘
```

- 컬럼: 번호(001~) / 표지(54×80) / 본문(제목·저자·한줄평) / 별점·날짜·정리글마커
- 정리글 있는 행 → 행 전체가 detail 페이지 링크
- 정리글 없는 행 → 클릭 시 같은 자리에서 펼침 (메타데이터 + 인용 quote + 태그)
- 정렬 기본: `dateRead`/`dateWatched`/`dateListened` DESC
- 필터 chips: 전체 · 별점 · 연도 · 상태 · (music만) type. 단순. 검색은 기존 `/search`로.

음악 row만 표지가 1:1 정사각형(80×80). 다른 타입(2:3 portrait, 54×80)과 다른 row 높이 → 시각적 type 구분이 자연스러움.

### `/library/books/<slug>` — 정리글 페이지

PostBannerY 레이아웃 적응:
```
[Breadcrumb] Library / Books / Process Economy

┌──────┐  BOOK · 002
│      │  Process Economy
│ 표지  │  by [Ozan Varol] · 2023
│      │  
│      │  RATING   READ     PAGES   LANG    STATUS
└──────┘  ★★★★    2025.11  320p    EN      Finished

──────────────────────────────────────
정리글 본문 (Prose)
```

- 저자 이름은 author 페이지로 링크.
- 표지는 140px × aspect-ratio 2/3, 그림자.
- 메타 strip은 작은 label + value 한 줄.
- 본문은 기존 Prose 컴포넌트 재사용 (max-w-max ≒ 65ch).

### `/library/books/author/<slug>` — 인물 페이지

```
[Breadcrumb] Library / Books / Authors / Haruki Murakami

[아바타]  Haruki Murakami
         Author · 1949 · Japan
         소설가, 번역가, 러너.

──────────────────────────────────────
READ WORKS · 4

001  표지  달리기를 말할 때…  2007    ★★★★  2025.05  ✎
002  표지  노르웨이의 숲       1987    ★★★★  2024.11
003  표지  1Q84                2009    ★★★    2024.03
004  표지  기사단장 죽이기     2017    ★★★    2023.08

──────────────────────────────────────
이 저자에 대해 (옵션, body 있을 때만)
…
```

- 같은 패턴이 director, artist에도 그대로 적용.

## 네비게이션

- 헤더에 "Library" 단일 entry. 호버 시 popover로 Books / Movies / Music sub-links. 기존 Header 컴포넌트의 popover 패턴 재사용 (`src/components/header/`).
- 모바일은 `/library` 랜딩에서 3개 type 탭.

## 인터랙션 디테일

### Inline expand 동작

- 클릭 → 행 배경이 `stone-100`으로 살짝 변하고, 행 아래에 dashed border + 메타 패널 슬라이드 다운 (≤200ms, ease-out, opacity + transform만).
- 한 번에 하나만 펼침. 다른 행 클릭 시 이전 행 collapse.
- 키보드: Enter/Space로 토글. 펼친 상태에서 ESC로 닫기.
- 정리글 있는 행은 expand 없이 그대로 detail 페이지로 navigate.

### 정리글 자동 판정

- `hasEssay` 필드는 frontmatter에 두지 않음. build 시 body 길이(공백 제외 N자 이상, e.g. 200자) 기준으로 자동 판정.
- 결과: 글이 충분히 쓰이면 자동으로 detail 페이지가 생기고 카탈로그 클릭 동작이 expand → navigate로 바뀜.

## 기존 콘텐츠 마이그레이션

현재 `post` 컬렉션에 `category: book` 3개, `category: movie` 3개 존재.

- `book` / `movie` 컬렉션으로 frontmatter 변환 + 이동
- `post`에서 제거 (이중 등록 X)
- 기존 URL `/posts/<slug>` → 새 URL `/library/books/<slug>` 또는 `/library/movies/<slug>`로 301 redirect (Astro의 `redirects` 옵션 또는 hosting 레벨)
- `category` enum에서 `book`, `movie` 제거 가능 (or 호환을 위해 유지)

해당 6개 파일:
- Books: `process-economy`, `where-are-we-now`, `if-snow-is-silence-falling-from-the-sky`
- Movies: `coffee-and-cigarettes`, `midsommar`, `rashomon`

## 비주얼 / 디자인 토큰

DESIGN.md 준수:
- 색: orange-500(`#D97706`) 액센트만, 외엔 warm stone neutrals. 별점·정리글 마커(`✎`)·인물 링크가 액센트.
- 타이포: 제목 Geist 600/700, 본문 Pretendard, 메타 라벨 Geist 10–11px uppercase letter-spacing.
- 모션: 펼침은 transform + opacity만, 200ms ease-out. `prefers-reduced-motion` 존중.

## 구현 범위 (이 spec 한 번에 가는 것)

이 spec 하나가 다루는 것:
1. 6개 컬렉션 스키마 + content config 추가
2. `/library` 랜딩 + 3개 카탈로그 + detail 페이지 + 인물 페이지 (Astro routes)
3. Editorial 리스트 컴포넌트 + inline expand 인터랙션
4. PostBannerY 기반 detail layout
5. 인물 페이지 layout
6. 헤더 네비 Library popover
7. 기존 6개 post 마이그레이션 + redirect
8. 영문 미러 (`/en/library/...`) — 번역은 옵션, 라우팅만 갖춤

다루지 않는 것:
- RSS / sitemap 통합 (별도 작업)
- 검색 인덱스 통합 (별도 작업)
- TV/Podcast 같은 추가 type
- 좋아요·조회수·댓글 통합 (기존 post에만, library는 reading 위주라 우선 제외)

## 미해결 / Open

- 책 표지·영화 포스터·앨범 아트는 어디서 가져올지: 직접 업로드 vs 외부 API. **이 spec은 직접 업로드만 가정** (외부 API 의존은 다음 phase).
- 음악 트랙 리스트 노출 위치(detail 페이지 어디에)는 implementation 단계에서 결정.
- `hasEssay` 임계값(200자) — 적당히 시작하고 운영하며 조정.
