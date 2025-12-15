#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { GoogleAuth } from "google-auth-library"

const keyFilePath = join(process.cwd(), "service-account-key.json")

if (!existsSync(keyFilePath)) {
  console.error("❌ service-account-key.json 파일을 찾을 수 없습니다.")
  console.error("   Google Cloud Console에서 서비스 계정 키를 다운로드하여")
  console.error("   프로젝트 루트에 service-account-key.json으로 저장하세요.")
  process.exit(1)
}

try {
  const credentials = JSON.parse(readFileSync(keyFilePath, "utf8"))

  const auth = new GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/indexing",
      "https://www.googleapis.com/auth/webmasters",
    ],
  })

  async function getAccessToken() {
    try {
      console.log("🔑 액세스 토큰을 생성하는 중...")

      const client = await auth.getClient()
      const token = await client.getAccessToken()

      console.log("✅ 액세스 토큰이 생성되었습니다:")
      console.log("")
      console.log("=== GitHub Secrets에 추가할 값 ===")
      console.log(token.token)
      console.log("================================")
      console.log("")
      console.log("📝 이 토큰을 GitHub 저장소의 Secrets > GSC_ACCESS_TOKEN에 추가하세요.")
      console.log("⚠️  이 토큰은 1시간 후 만료됩니다.")
    } catch (error) {
      console.error("❌ 액세스 토큰 생성 실패:", error.message)
      process.exit(1)
    }
  }

  getAccessToken()
} catch (error) {
  console.error("❌ JSON 파일 읽기 실패:", error.message)
  process.exit(1)
}
