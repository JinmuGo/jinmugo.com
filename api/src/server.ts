import cors from "cors";
import dotenv from "dotenv";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { startSyncJob } from "./jobs/firestore-sync.job";
import { initializePocketBase, pb } from "./lib/pocketbase";
import { likesRouter } from "./routes/likes";
import { postsRouter } from "./routes/posts";
import { viewsRouter } from "./routes/views";

// 환경 변수 로드
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// 보안 헤더 설정
app.use(helmet());

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
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.headers.origin ||
    "unknown";

  req.clientIP = clientIP as string;
  next();
});

// Rate Limiter 설정
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  limit: 100, // 15분당 100회 요청 제한
  standardHeaders: true, // RateLimit-* 헤더 활성화
  legacyHeaders: true, // X-RateLimit-* 헤더 활성화
  keyGenerator: (req) => req.clientIP, // 사용자 정의 IP 식별 사용
  message: { error: "Too many requests, please try again later." },
});

// API 라우트에 Rate Limiter 적용
app.use("/api", apiLimiter);

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
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    pocketbase: pb.baseUrl,
  });
});

// 404 핸들러
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// 에러 핸들러
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  });
});

// 서버 시작 전 PocketBase 초기화 및 동기화 작업 시작
(async () => {
  try {
    // PocketBase 인증 초기화
    await initializePocketBase();

    // Firestore → PocketBase 동기화 작업 시작 (테스트 환경 제외)
    if (process.env.NODE_ENV !== "test") {
      startSyncJob();
    }

    // 서버 시작
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

export default app;
