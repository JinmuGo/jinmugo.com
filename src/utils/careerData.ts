export const profile = {
  name: "고진무",
  englishName: "Jinmu Go",
  headline: "Backend & Infrastructure Engineer",
  focus: "Developer Tools · Infrastructure · Cloud Native",
  summary:
    "Go 기반 백엔드, 개발자 도구, 인프라 자동화를 중심으로 실제 배포와 운영까지 가져가는 엔지니어입니다.",
  email: "hi@jinmugo.com",
  github: "https://github.com/JinmuGo",
  linkedin: "https://linkedin.com/in/jinmugo",
  site: "https://jinmugo.com",
}

export const proofMetrics = [
  { label: "cinchcli releases", value: "17" },
  { label: "Obsidian downloads", value: "3,227" },
  { label: "Open source stars", value: "22" },
  { label: "cinchcli binary", value: "약 7MB" },
]

export const skills = [
  {
    category: "Languages",
    items: ["Go", "C/C++", "TypeScript / JavaScript"],
  },
  {
    category: "Backend",
    items: ["Connect-RPC", "Protocol Buffers", "PostgreSQL", "OAuth 2.0", "REST"],
  },
  {
    category: "Infra & DevOps",
    items: ["Docker", "Terraform", "GitHub Actions", "goreleaser"],
  },
  {
    category: "Cloud",
    items: ["GCP Cloud Run", "Cloud SQL", "AWS"],
  },
  {
    category: "Observability",
    items: ["OpenTelemetry", "VictoriaMetrics", "VictoriaLogs", "Grafana"],
  },
  {
    category: "Cloud Native",
    items: ["Kubernetes", "containerd", "Container Runtimes"],
  },
]

export const projects = [
  {
    id: "cinchcli",
    name: "cinchcli",
    meta: "Claude·Cursor·Codex 간 클립과 에이전트 컨텍스트를 동기화하는 self-hosted 플랫폼",
    role: "설계·운영",
    period: "2026",
    highlight: true,
    links: [
      { label: "cinchcli.com", href: "https://cinchcli.com" },
      { label: "github.com/cinchcli", href: "https://github.com/cinchcli" },
    ],
    stack: [
      "Go",
      "Connect-RPC",
      "Protocol Buffers",
      "MCP",
      "PostgreSQL",
      "OAuth 2.0",
      "E2EE",
      "Docker",
      "goreleaser",
      "OpenTelemetry",
    ],
    metrics: ["17회 릴리스", "약 7MB 바이너리", "멀티아치 배포"],
    problem:
      "여러 AI 에이전트 환경에서 분산되는 클립과 컨텍스트를 통합 관리하기 위해 개발했습니다.",
    bullets: [
      "Connect-RPC·Protocol Buffers 기반 와이어 프로토콜 설계, 서버 스트리밍 실시간 동기화",
      "claude mcp add cinch로 Claude·Cursor·Codex에 read-only MCP 제공 (cinch ai fix)",
      "GitHub·Google OAuth 2.0 직접 구현, 클라이언트 E2EE 적용",
      "PostgreSQL 스키마 설계 및 마이그레이션 관리",
      "Docker·goreleaser 기반 멀티아치 배포 자동화 · 17회 릴리스 · 약 7MB 바이너리 유지",
      "OpenTelemetry 기반 관측성 구축 및 핵심 플로우 테스트로 회귀 방지",
    ],
  },
  {
    id: "everly-ai",
    name: "Everly AI",
    meta: "AI 영정·장수 사진 서비스",
    role: "Backend·Infra Owner",
    period: "2026",
    links: [{ label: "everlyai.jinmu.me", href: "https://everlyai.jinmu.me" }],
    stack: [
      "Astro SSR",
      "Express",
      "PostgreSQL",
      "Terraform",
      "GCP Cloud Run",
      "Artifact Registry",
      "Docker",
      "GitHub Actions",
    ],
    metrics: ["약 30초 변환", "한/영 i18n", "IaC"],
    problem:
      "회원가입 없이 평상복 사진을 정장·한복 영정 사진으로 변환해 즉시 체험할 수 있는 서비스를 운영했습니다.",
    bullets: [
      "평상복 사진을 정장·한복 영정 사진으로 약 30초 내 변환",
      "회원가입 없이 즉시 체험 가능, 한/영 i18n 지원",
      "Terraform으로 Cloud Run·Artifact Registry·Firebase IaC 구축",
      "Docker·GitHub Actions 기반 자동 빌드 및 배포 파이프라인 구축",
      "PostgreSQL 기반 서비스 데이터 관리",
    ],
  },
  {
    id: "sls",
    name: "sls",
    meta: "SSH 호스트와 Docker 컨테이너를 빠르게 탐색·접속하는 개발자 CLI",
    role: "Creator",
    period: "2025",
    links: [
      { label: "sls.jinmu.me", href: "https://sls.jinmu.me" },
      { label: "github.com/JinmuGo/sls", href: "https://github.com/JinmuGo/sls" },
    ],
    stack: ["Go", "SSH", "Docker"],
    metrics: ["Homebrew 배포", "GitHub ★17", "v1.3.x 운영"],
    problem:
      "SSH 호스트와 원격 Docker 컨테이너를 ls처럼 탐색하고 fzf로 즉시 접속하도록 만든 CLI입니다.",
    bullets: [
      "SSH 호스트를 ls처럼 탐색하고 fzf로 즉시 접속",
      "원격 Docker 컨테이너 자동 탐색 후 직접 셸 연결",
      "Homebrew 배포 · GitHub ★17 · v1.3.x 운영 중",
    ],
  },
  {
    id: "obsidian-plugins",
    name: "Obsidian Plugins",
    meta: "Theme by Folder, Go Up",
    role: "Open Source",
    period: "2024",
    links: [
      {
        label: "obsidian-theme-by-folder",
        href: "https://github.com/JinmuGo/obsidian-theme-by-folder",
      },
      { label: "obsidian-go-up", href: "https://github.com/JinmuGo/obsidian-go-up" },
    ],
    stack: ["TypeScript", "Obsidian API"],
    metrics: ["누적 다운로드 3,227", "GitHub ★22"],
    problem:
      "개인 노트 워크플로에서 반복되는 테마 전환과 상위 문서 이동을 자동화한 Obsidian 플러그인 2종입니다.",
    bullets: ["Theme by Folder: 노트 폴더별 테마 자동 전환", "Go Up: 지정 상위 문서로 빠른 이동"],
  },
  {
    id: "webserv-minishell",
    name: "Webserv · Minishell",
    meta: "C/C++ 시스템·네트워크 프로그래밍",
    role: "42 Seoul",
    period: "2023",
    links: [
      { label: "42seoul-jgo/webserv", href: "https://github.com/42seoul-jgo/webserv" },
      { label: "42seoul-jgo/Minishell", href: "https://github.com/42seoul-jgo/Minishell" },
    ],
    stack: ["C/C++", "kqueue", "System Programming"],
    metrics: ["HTTP/1.1", "kqueue", "Unix shell"],
    problem:
      "운영체제와 네트워크 프로그래밍의 저수준 동작을 직접 구현하며 백엔드 기반기를 다졌습니다.",
    bullets: [
      "Webserv: kqueue 기반 이벤트 루프 HTTP 서버 구현",
      "HTTP/1.1 요청 처리 및 멀티플렉싱 구조 설계",
      "Minishell: 시스템 콜로 Unix 셸 구현, 환경변수 해시테이블 직접 구현해 조회 성능 개선",
    ],
  },
]

export const leadership = [
  {
    name: "WTIA Global Entrepreneurship Program",
    meta: "시애틀 · 2026 · 6주 집중 창업 연수",
    bullets: ["WTIA·UW CoMotion 글로벌 창업 프로그램 최종 피칭 1위"],
  },
  {
    name: "AIMuse",
    meta: "AI 도슨트 서비스 · 2025 IA×AI 해커톤 · 팀",
    bullets: [
      "우수상 수상 — 작품 데이터를 활용한 개인화 AI 도슨트 개발",
      "기획·UX 설계·프론트엔드 챗봇 구현",
    ],
  },
  {
    name: "어이 할망",
    meta: "제주 부모-육지 자녀 소통 플랫폼 · 구름톤 12기 · 팀",
    bullets: [
      "기획자·디자이너와 협업해 제주 부모-육지 자식 간 연결 플랫폼 '어이, 할망' 개발 및 배포",
    ],
  },
]

export const education = [
  {
    name: "42 Seoul",
    meta: "2022 - 2026 · C/C++ 기반 시스템·네트워크 프로그래밍",
  },
  {
    name: "Kangwon National University",
    meta: "2018.02 - 2026.08 졸업 예정 · Visual & Culture",
  },
]

export const certifications = ["AWS Certified Cloud Practitioner"]
