# Jinmu Blog API

Cloudflare Workers 기반의 블로그 API 서버입니다. **Chanfana**와 **OpenAPI 3.1**을 사용하여 자동 문서화되며, **Cloudflare D1**과 **Prisma**를 통해 데이터베이스를 관리합니다.

## 🚀 주요 기능

- **✨ Like API** - 포스트 좋아요 시스템 (최대 5개/사용자)
- **👀 View API** - 포스트 조회수 관리 (D1 데이터베이스 사용)
- **🌍 Geolocation API** - 사용자 위치 정보 제공
- **📚 OpenAPI 문서** - 자동 생성되는 API 문서
- **🔥 Fast & Scalable** - Cloudflare Edge Network 기반

## 🛠 기술 스택

- **Runtime**: Cloudflare Workers
- **Framework**: Hono + Chanfana
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Prisma
- **Documentation**: OpenAPI 3.1
- **TypeScript**: 완전한 타입 안전성

## 📦 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. Prisma 클라이언트 생성

```bash
npm run db:generate
```

### 3. Cloudflare 리소스 생성

#### D1 데이터베이스 생성
```bash
# D1 데이터베이스 생성
wrangler d1 create blog-db

# 출력에서 database_id를 복사하여 wrangler.jsonc에 추가
```

### 4. 환경 설정

#### wrangler.jsonc 업데이트
```jsonc
{
  // ... 기존 설정
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "blog-db",
      "database_id": "여기에-실제-database-id-입력"
    }
  ]
}
```

#### 개발용 환경 변수 설정
```bash
# .dev.vars.example을 복사
cp .dev.vars.example .dev.vars

# .dev.vars 파일 편집
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

### 5. 데이터베이스 마이그레이션

```bash
# 로컬 개발용 (SQLite 파일)
npm run db:push

# 프로덕션 D1 데이터베이스에 스키마 적용
wrangler d1 execute blog-db --file=./migrations/schema.sql
```

## 🏃‍♂️ 실행

### 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 다음 URL에서 확인 가능합니다:
- **API 문서**: http://localhost:8787/
- **Health Check**: http://localhost:8787/health

### 프로덕션 배포

```bash
npm run deploy
```

## 📡 API 엔드포인트

### Like API
- `POST /api/like/:slug` - 포스트 좋아요 추가
- `GET /api/like/:slug/me` - 내 좋아요 상태 조회
- `GET /api/like/:slug/total` - 전체 좋아요 수 조회

### View API
- `GET /api/view/:slug` - 포스트 조회수 조회
- `POST /api/view/:slug` - 포스트 조회수 증가

### Geolocation API
- `GET /api/geolocation` - 사용자 위치 정보 조회

### 기타
- `GET /health` - 서버 상태 확인

## 🔐 인증

현재 API는 `x-user-id` 헤더를 통한 간단한 사용자 식별을 사용합니다:

```javascript
fetch('/api/like/example-post', {
  method: 'POST',
  headers: {
    'x-user-id': 'user-123'
  }
})
```

## 📝 API 응답 형식

모든 API는 일관된 응답 형식을 사용합니다:

```json
{
  "success": true,
  "data": {
    // 실제 데이터
  }
}
```

오류 응답:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 배포
npm run deploy

# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# 데이터베이스 마이그레이션
npm run db:migrate

# Prisma Studio 실행
npm run db:studio

# 타입 생성
npm run cf-typegen
```

## 🏗 프로젝트 구조

```
src/
├── endpoints/          # API 엔드포인트들
│   ├── like/          # 좋아요 관련 API
│   ├── view/          # 조회수 관련 API
│   └── geolocation/   # 위치 정보 API
├── lib/               # 유틸리티 함수들
│   └── db.ts          # Prisma 클라이언트 설정
├── types.ts           # TypeScript 타입 정의
└── index.ts           # 메인 애플리케이션 파일
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

---

**Powered by Cloudflare Workers** ⚡
