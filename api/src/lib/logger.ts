import winston from "winston";

// 로그 레벨 정의
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

// 로그 색상 정의
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
} as const;

winston.addColors(logColors);

// 환경별 로그 레벨 설정
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || "development";
  switch (env) {
    case "production":
      return "info";
    case "test":
      return "error";
    default:
      return "debug";
  }
};

// 로그 포맷 설정
const createLogFormat = (isDevelopment: boolean) => {
  if (isDevelopment) {
    return winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.colorize({ all: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      }),
    );
  }

  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );
};

// Winston logger 인스턴스 생성
const logger = winston.createLogger({
  level: getLogLevel(),
  levels: logLevels,
  format: createLogFormat(process.env.NODE_ENV === "development"),
  defaultMeta: { service: "api-server" },
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: createLogFormat(process.env.NODE_ENV === "development"),
    }),
  ],
});

// 프로덕션 환경에서는 파일 로그도 추가
if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  );

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
  );
}

// 테스트 환경에서는 로그 출력 최소화
if (process.env.NODE_ENV === "test") {
  logger.transports.forEach((transport) => {
    if (transport instanceof winston.transports.Console) {
      transport.silent = true;
    }
  });
}

// Logger 인터페이스 정의
export interface Logger {
  error: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  http: (message: string, meta?: unknown) => void;
  debug: (message: string, meta?: unknown) => void;
}

// Logger 인스턴스 내보내기
export { logger };

// 편의 함수들
export const logError = (message: string, error?: Error | unknown) => {
  logger.error(
    message,
    error instanceof Error ? { stack: error.stack, message: error.message } : error,
  );
};

export const logWarn = (message: string, meta?: unknown) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: unknown) => {
  logger.info(message, meta);
};

export const logHttp = (message: string, meta?: unknown) => {
  logger.http(message, meta);
};

export const logDebug = (message: string, meta?: unknown) => {
  logger.debug(message, meta);
};

// 스크립트용 logger (콘솔 출력 강조)
export const createScriptLogger = () => {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "HH:mm:ss" }),
      winston.format.colorize({ all: true }),
      winston.format.printf(({ message }) => `${message}`),
    ),
    transports: [new winston.transports.Console()],
  });
};

export default logger;
