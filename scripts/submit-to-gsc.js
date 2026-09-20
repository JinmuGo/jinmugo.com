#!/usr/bin/env node

import { config } from "dotenv"
import { GoogleAuth } from "google-auth-library"

config()

const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS
const GSC_SITE_URL = process.env.GSC_SITE_URL
const GSC_PROPERTY_ID = process.env.GSC_PROPERTY_ID

if (!GOOGLE_APPLICATION_CREDENTIALS || !GSC_SITE_URL || !GSC_PROPERTY_ID) {
  console.error("❌ Missing required environment variables:")
  console.error("   - GOOGLE_APPLICATION_CREDENTIALS")
  console.error("   - GSC_SITE_URL")
  console.error("   - GSC_PROPERTY_ID")
  process.exit(1)
}

async function getAccessToken(auth) {
  const client = await auth.getClient()
  const accessToken = await client.getAccessToken()
  return accessToken.token
}

async function submitUrlToGSC(auth, url, urlType) {
  try {
    console.log(`🚀 Submitting ${urlType} (${url}) to Google Search Console...`)

    const token = await getAccessToken(auth)

    // webmasters/v3 엔드포인트 사용
    const response = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY_ID)}/sitemaps/${encodeURIComponent(url)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // body는 비워둠 - URL 경로에 sitemap 정보가 포함됨
      },
    )

    console.log(`📊 ${urlType} Response status: ${response.status}`)

    const responseText = await response.text()
    console.log(`📊 ${urlType} Response body: ${responseText}`)

    if (!response.ok) {
      // 429 응답 시 바로 종료
      if (response.status === 429) {
        console.error(`❌ Rate limit exceeded (429). Stopping submission.`)
        console.error(`   Please wait before retrying.`)
        process.exit(0)
      }

      if (response.status === 403) {
        console.error(`❌ ${urlType} 권한 오류: 서비스 계정이 사이트에 대한 권한이 없습니다.`)
        console.error("해결 방법:")
        console.error("1. Google Search Console에서 사이트 속성으로 이동")
        console.error("2. 설정 > 사용자 및 권한으로 이동")
        console.error("3. 서비스 계정 이메일을 소유자 또는 전체 사용자로 추가")
        try {
          const creds = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS)
          console.error(`4. 서비스 계정 이메일: ${creds.client_email}`)
        } catch {
          console.error("4. 서비스 계정 이메일을 확인하세요")
        }
        console.error("5. 또는 GSC_SITE_URL이 올바른지 확인하세요")
      }
      throw new Error(`${urlType} HTTP ${response.status}: ${responseText}`)
    }

    console.log(`✅ ${urlType} submitted successfully!`)

    // 응답이 JSON인 경우에만 파싱
    if (responseText.trim()) {
      try {
        const result = JSON.parse(responseText)
        console.log(`📊 ${urlType} Response JSON:`, JSON.stringify(result, null, 2))
      } catch {
        console.log(`📊 ${urlType} Response is not JSON (this is normal for successful submission)`)
      }
    }

    return true
  } catch (error) {
    console.error(`❌ Failed to submit ${urlType}:`, error.message)
    return false
  }
}

async function submitAllToGSC() {
  try {
    console.log("🚀 Starting submission to Google Search Console...")

    // Google Auth 클라이언트 생성 (credentials 객체 직접 전달)
    const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS)
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/webmasters"],
    })

    // 제출할 URL 목록
    const urlsToSubmit = [
      { url: `${GSC_SITE_URL}/sitemap-index.xml`, type: "Sitemap" },
      { url: `${GSC_SITE_URL}/rss.xml`, type: "RSS Feed" },
      { url: `${GSC_SITE_URL}/en/rss.xml`, type: "English RSS Feed" },
    ]

    let successCount = 0
    let failureCount = 0

    // 각 URL을 순차적으로 제출
    for (let i = 0; i < urlsToSubmit.length; i++) {
      const { url, type } = urlsToSubmit[i]
      const success = await submitUrlToGSC(auth, url, type)
      if (success) {
        successCount++
      } else {
        failureCount++
      }

      // 요청 간 간격을 두어 API 제한을 피함
      if (i < urlsToSubmit.length - 1) {
        console.log("⏳ Waiting 1 second before next submission...")
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // 최종 결과 요약
    console.log("\n📊 Final Results:")
    console.log(`✅ Successfully submitted: ${successCount}`)
    console.log(`❌ Failed submissions: ${failureCount}`)
    console.log(`📈 Total attempted: ${urlsToSubmit.length}`)

    if (failureCount > 0) {
      console.log("\n⚠️  Some submissions failed. Check the logs above for details.")
      process.exit(1)
    } else {
      console.log("\n🎉 All submissions completed successfully!")
    }
  } catch (error) {
    console.error("❌ Failed to submit to Google Search Console:", error.message)
    process.exit(1)
  }
}

submitAllToGSC()
