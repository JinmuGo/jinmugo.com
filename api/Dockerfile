# 멀티스테이지 빌드를 사용한 Express API 서버 Dockerfile
# 이 Dockerfile은 api/ 디렉토리에서 실행되어야 합니다

# 빌드 스테이지
FROM node:20-alpine AS builder

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package.json ./

# 임시로 pnpm-lock.yaml 생성 (standalone 모드)
RUN pnpm install --no-frozen-lockfile || pnpm install

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN pnpm run build

# 프로덕션 스테이지
FROM node:20-alpine AS production

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 보안을 위한 non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package.json ./

# 프로덕션 의존성만 설치
RUN pnpm install --prod

# 빌드된 파일 복사
COPY --from=builder /app/dist ./dist

# 사용자 권한 설정
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# 포트 노출
EXPOSE 3001

# 헬스체크 추가 (Node.js 내장 사용)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# 애플리케이션 실행
CMD ["node", "dist/server.js"] 