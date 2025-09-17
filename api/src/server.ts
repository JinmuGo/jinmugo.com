import cors from "cors";
import dotenv from "dotenv";
import express, { type Express } from "express";
import { pb } from "./lib/pocketbase";
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
app.listen(PORT, () => {
  console.log(`🚀 API Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️  PocketBase URL: ${process.env.PB_URL || "http://127.0.0.1:8090"}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || "*"}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

export default app;
