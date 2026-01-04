# 멀티스테이지 빌드를 사용한 Express API 서버 Dockerfile
# 이 Dockerfile은 모노레포 루트에서 빌드되어야 합니다 (빌드 컨텍스트: 모노레포 루트)
# 사용 예: docker build -f Dockerfile .

# 빌드 스테이지
FROM node:20-alpine AS builder

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 작업 디렉토리 설정
WORKDIR /app

# 모노레포 루트 파일 복사 (워크스페이스 설정)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# 워크스페이스 패키지 복사
COPY packages/ ./packages/

# API 앱 복사
COPY apps/api/ ./apps/api/

# 모든 의존성 설치 (빌드에 필요한 devDependencies 포함)
RUN pnpm install --frozen-lockfile

# 워크스페이스 패키지 빌드 (의존성 순서대로)
RUN pnpm --filter @jinmu/types build
RUN pnpm --filter @jinmu/utils build

# API 애플리케이션 빌드
RUN pnpm --filter api build

# 프로덕션 스테이지
FROM node:20-alpine AS production

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 보안을 위한 non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# 작업 디렉토리 설정
WORKDIR /app

# 모노레포 루트 파일 복사 (워크스페이스 설정)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# 워크스페이스 패키지의 package.json 및 빌드된 dist 복사 (빌더 스테이지에서)
COPY --from=builder /app/packages/types/package.json ./packages/types/
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/utils/package.json ./packages/utils/
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist

# API의 package.json 및 빌드된 dist 복사 (빌더 스테이지에서)
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# 프로덕션 의존성만 설치 (워크스페이스 패키지는 이미 빌드된 결과물 사용)
RUN pnpm install --prod --frozen-lockfile

# 사용자 권한 설정
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# 작업 디렉토리를 API로 변경
WORKDIR /app/apps/api

# 포트 노출
EXPOSE 3001

# 헬스체크 추가 (Node.js 내장 사용)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 애플리케이션 실행
# GOOGLE_CREDENTIALS_BASE64 환경 변수가 있으면 디코딩하여 파일 생성
CMD sh -c 'if [ -n "$GOOGLE_CREDENTIALS_BASE64" ]; then echo "$GOOGLE_CREDENTIALS_BASE64" | base64 -d > service-account-key.json; fi && node dist/server.js'

