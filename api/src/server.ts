import cors from "cors";
import dotenv from "dotenv";
import express, { type Express } from "express";
import { logger } from "./lib/logger";
import { pb } from "./lib/pocketbase";
import { closeRedis, getRedisClient, getViewStats, initRedis } from "./lib/redis";
import { likesRouter } from "./routes/likes";
import { postsRouter } from "./routes/posts";
import { viewsRouter } from "./routes/views";

// 환경 변수 로드
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4321",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IP 주소 추출 미들웨어
app.use((req, _res, next) => {
  const clientIP =
    req.headers.x_forwarded_for || req.headers.x_real_ip || req.headers.origin || "unknown";

  req.clientIP = clientIP as string;
  next();
});

// Root path 라우터
app.get("/", (_req, res) => {
  const corsOrigin = process.env.CORS_ORIGIN;

  if (corsOrigin && corsOrigin !== "*") {
    res.send(`jinmu.me blog API server - configured for ${corsOrigin}`);
  } else {
    res.send("jinmu.me blog API server");
  }
});

// 라우트 설정
app.use("/api/posts", postsRouter);
app.use("/api/likes", likesRouter);
app.use("/api/views", viewsRouter);

// 헬스 체크
app.get("/health", async (_req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    pocketbase: pb.baseUrl,
    redis: "disconnected",
    redisStats: null as { totalKeys: number; memoryUsage: string } | null,
  };

  // Redis 연결 상태 및 통계 확인
  try {
    const redis = await getRedisClient();
    await redis.ping();
    health.redis = "connected";

    // Redis 통계 정보 추가
    try {
      health.redisStats = await getViewStats();
    } catch (statsError) {
      logger.warn("Redis 통계 조회 실패:", statsError);
    }
  } catch (error) {
    health.redis = "disconnected";
    logger.warn("Redis 연결 실패:", error);
  }

  res.json(health);
});

// 404 핸들러
app.use("*", (_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// 에러 핸들러
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

// 서버 시작
app.listen(PORT, async () => {
  logger.info(`🚀 API Server is running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`🗄️  PocketBase URL: ${process.env.PB_URL || "http://127.0.0.1:8090"}`);
  logger.info(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || "*"}`);

  // Redis 연결 초기화
  try {
    await initRedis();
    logger.info(`🔴 Redis 연결 완료`);
  } catch (error) {
    logger.warn(`⚠️  Redis 연결 실패:`, error);
    logger.info(`📊 Redis 없이도 서버는 정상 작동합니다 (캐시 기능 제외)`);
    logger.info(`💡 Redis 연결을 원한다면: pnpm run docker:redis`);
  }

  logger.info(`✅ Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("🛑 SIGTERM received, shutting down gracefully...");
  await closeRedis();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("🛑 SIGINT received, shutting down gracefully...");
  await closeRedis();
  process.exit(0);
});

export default app;
