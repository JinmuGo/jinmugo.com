import dotenv from "dotenv";

// 테스트 환경변수 로드
dotenv.config({ path: ".env.test" });

// 기본 환경변수가 없는 경우 테스트용 기본값 설정
process.env.PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
process.env.NODE_ENV = "test";
process.env.PORT = "0"; // 랜덤 포트 사용

// 테스트 중 console 로그 최소화
if (process.env.VITEST_LOG_LEVEL !== "verbose") {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
}
