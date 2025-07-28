#!/usr/bin/env node

// 환경변수 테스트 스크립트
const requiredEnvVars = ["GOOGLE_APPLICATION_CREDENTIALS", "GSC_SITE_URL", "GSC_PROPERTY_ID"]

console.log("🔍 환경변수 확인 중...\n")

let allSet = true

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  if (value) {
    console.log(`✅ ${envVar}: 설정됨`)
    if (envVar === "GOOGLE_APPLICATION_CREDENTIALS") {
      try {
        const parsed = JSON.parse(value)
        console.log(`   - 프로젝트 ID: ${parsed.project_id}`)
        console.log(`   - 서비스 계정: ${parsed.client_email}`)
      } catch (e) {
        console.log(`   - ⚠️  JSON 파싱 실패: ${e.message}`)
        allSet = false
      }
    } else {
      console.log(`   - 값: ${value}`)
    }
  } else {
    console.log(`❌ ${envVar}: 설정되지 않음`)
    allSet = false
  }
  console.log("")
}

if (allSet) {
  console.log("🎉 모든 환경변수가 올바르게 설정되었습니다!")
  console.log("\n📝 다음 명령어로 테스트할 수 있습니다:")
  console.log("   npm run postbuild")
  console.log("   또는")
  console.log("   node scripts/submit-to-gsc.js")
  console.log("   node scripts/submit-urls-to-gsc.js")
} else {
  console.log("❌ 일부 환경변수가 설정되지 않았습니다.")
  console.log("\n💡 설정 방법:")
  console.log("   1. .env 파일을 생성하고 env.example을 참고하여 설정")
  console.log("   2. 또는 환경변수를 직접 설정")
  console.log("   3. 또는 export 명령어로 설정")
  console.log("\n   예시:")
  console.log('   export GOOGLE_APPLICATION_CREDENTIALS=\'{"type":"service_account",...}\'')
  console.log("   export GSC_SITE_URL=https://jinmu.me")
  console.log("   export GSC_PROPERTY_ID=https://jinmu.me")
}
