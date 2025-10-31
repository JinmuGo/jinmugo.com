#!/usr/bin/env tsx

/**
 * Redis 관리 통합 스크립트
 * 마이그레이션, 검증, 백업, 복원, 통계 조회 등 모든 Redis 관련 작업을 통합 관리
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { createScriptLogger } from "../src/lib/logger";
import {
  backupViewData,
  cleanupExpiredKeys,
  closeRedis,
  getDetailedMemoryInfo,
  getPopularPosts,
  getTotalViews,
  getViewStats,
  restoreViewData,
} from "../src/lib/redis";
import { PageViewMigration } from "./migrate-pageviews-to-redis";
import { MigrationValidator } from "./validate-migration";

// 환경변수 로드
config();

interface ManagementOptions {
  action: "migrate" | "validate" | "stats" | "backup" | "restore" | "cleanup" | "popular" | "help";
  limit?: number;
  backupFile?: string;
}

class RedisManager {
  private logger = createScriptLogger();

  /**
   * 메인 실행 함수
   */
  async run(options: ManagementOptions): Promise<void> {
    this.logger.info("🔧 Redis 관리 도구");
    this.logger.info("=".repeat(50));

    try {
      switch (options.action) {
        case "migrate":
          await this.migrate();
          break;
        case "validate":
          await this.validate();
          break;
        case "stats":
          await this.showStats();
          break;
        case "backup":
          await this.backup(options.backupFile);
          break;
        case "restore":
          await this.restore(options.backupFile);
          break;
        case "cleanup":
          await this.cleanup();
          break;
        case "popular":
          await this.showPopularPosts(options.limit);
          break;
        case "help":
          this.showHelp();
          break;
        default:
          this.logger.error("❌ 알 수 없는 액션입니다. --help를 참조하세요.");
          process.exit(1);
      }
    } catch (error) {
      this.logger.error("❌ 작업 실패:", error);
      process.exit(1);
    } finally {
      await closeRedis();
    }
  }

  /**
   * 마이그레이션 실행
   */
  private async migrate(): Promise<void> {
    this.logger.info("🚀 PocketBase → Redis 마이그레이션 시작");
    const migration = new PageViewMigration();
    await migration.migrate();
    await migration.validate();
  }

  /**
   * 마이그레이션 검증
   */
  private async validate(): Promise<void> {
    this.logger.info("🔍 마이그레이션 검증 시작");
    const validator = new MigrationValidator();
    await validator.validate();
  }

  /**
   * Redis 통계 조회
   */
  private async showStats(): Promise<void> {
    this.logger.info("📊 Redis 통계 조회");

    const [basicStats, detailedInfo, totalViews] = await Promise.all([
      getViewStats(),
      getDetailedMemoryInfo(),
      getTotalViews(),
    ]);

    this.logger.info("\n📈 기본 통계:");
    this.logger.info(`  조회수 키 수: ${basicStats.totalKeys}개`);
    this.logger.info(`  메모리 사용량: ${basicStats.memoryUsage}`);
    this.logger.info(`  전체 조회수: ${totalViews.toLocaleString()}회`);

    this.logger.info("\n💾 상세 메모리 정보:");
    this.logger.info(`  현재 메모리: ${detailedInfo.usedMemory}`);
    this.logger.info(`  피크 메모리: ${detailedInfo.usedMemoryPeak}`);
    this.logger.info(`  전체 키 수: ${detailedInfo.totalKeys}개`);
    this.logger.info(`  조회수 키 수: ${detailedInfo.viewKeys}개`);
    this.logger.info(`  키당 메모리: ${detailedInfo.memoryPerKey}`);
  }

  /**
   * 인기 포스트 조회
   */
  private async showPopularPosts(limit: number = 10): Promise<void> {
    this.logger.info(`🔥 인기 포스트 TOP ${limit}`);

    const popularPosts = await getPopularPosts(limit);

    if (popularPosts.length === 0) {
      this.logger.info("📝 인기 포스트가 없습니다.");
      return;
    }

    this.logger.info("\n순위 | 포스트 | 조회수");
    this.logger.info("-".repeat(40));

    popularPosts.forEach((post, index) => {
      this.logger.info(
        `${(index + 1).toString().padStart(2)} | ${post.slug.padEnd(20)} | ${post.views.toLocaleString()}`,
      );
    });
  }

  /**
   * Redis 데이터 백업
   */
  private async backup(backupFile?: string): Promise<void> {
    const fileName = backupFile || `redis-backup-${new Date().toISOString().split("T")[0]}.json`;
    const filePath = join(process.cwd(), "backups", fileName);

    this.logger.info(`💾 Redis 데이터 백업 중... (${fileName})`);

    const backupData = await backupViewData();

    // 백업 디렉토리 생성
    const { mkdirSync } = await import("node:fs");
    mkdirSync(join(process.cwd(), "backups"), { recursive: true });

    // 백업 데이터 저장
    writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    this.logger.info(`✅ 백업 완료: ${filePath}`);
    this.logger.info(`📊 백업된 데이터: ${backupData.length}개 포스트`);
  }

  /**
   * Redis 데이터 복원
   */
  private async restore(backupFile?: string): Promise<void> {
    if (!backupFile) {
      this.logger.error("❌ 복원할 백업 파일을 지정해주세요.");
      process.exit(1);
    }

    const filePath = join(process.cwd(), "backups", backupFile);

    if (!existsSync(filePath)) {
      this.logger.error(`❌ 백업 파일을 찾을 수 없습니다: ${filePath}`);
      process.exit(1);
    }

    this.logger.info(`🔄 Redis 데이터 복원 중... (${backupFile})`);

    const backupData = JSON.parse(readFileSync(filePath, "utf-8"));
    await restoreViewData(backupData);

    this.logger.info(`✅ 복원 완료: ${backupData.length}개 포스트`);
  }

  /**
   * 만료된 키 정리
   */
  private async cleanup(): Promise<void> {
    this.logger.info("🧹 만료된 키 정리 중...");

    const cleanedCount = await cleanupExpiredKeys();

    this.logger.info(`✅ 정리 완료: ${cleanedCount}개 키 제거`);
  }

  /**
   * 도움말 출력
   */
  private showHelp(): void {
    this.logger.info(`
🔧 Redis 관리 도구 사용법

사용법: npm run redis <action> [options]

Actions:
  migrate     PocketBase에서 Redis로 데이터 마이그레이션
  validate    마이그레이션 검증
  stats       Redis 통계 조회
  backup      Redis 데이터 백업
  restore     Redis 데이터 복원
  cleanup     만료된 키 정리
  popular     인기 포스트 조회
  help        이 도움말 표시

Options:
  --limit <number>     인기 포스트 조회 개수 (기본값: 10)
  --file <filename>    백업/복원 파일명

Examples:
  npm run redis migrate
  npm run redis validate
  npm run redis stats
  npm run redis backup --file my-backup.json
  npm run redis restore --file my-backup.json
  npm run redis popular --limit 20
  npm run redis cleanup
    `);
  }
}

// 명령행 인수 파싱
function parseArgs(): ManagementOptions {
  const args = process.argv.slice(2);
  const options: ManagementOptions = {
    action: "help",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (
      arg === "migrate" ||
      arg === "validate" ||
      arg === "stats" ||
      arg === "backup" ||
      arg === "restore" ||
      arg === "cleanup" ||
      arg === "popular" ||
      arg === "help"
    ) {
      options.action = arg as ManagementOptions["action"];
    } else if (arg === "--limit" && i + 1 < args.length) {
      options.limit = parseInt(args[i + 1]);
      i++;
    } else if (arg === "--file" && i + 1 < args.length) {
      options.backupFile = args[i + 1];
      i++;
    }
  }

  return options;
}

// 스크립트 실행
async function main() {
  const options = parseArgs();
  const manager = new RedisManager();
  await manager.run(options);
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

export { RedisManager };
