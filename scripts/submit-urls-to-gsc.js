#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { config } from "dotenv"
import { GoogleAuth } from "google-auth-library"

config()

const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS
const GSC_SITE_URL = process.env.GSC_SITE_URL

if (!GOOGLE_APPLICATION_CREDENTIALS || !GSC_SITE_URL) {
  console.error("❌ Missing required environment variables:")
  console.error("   - GOOGLE_APPLICATION_CREDENTIALS")
  console.error("   - GSC_SITE_URL")
  process.exit(1)
}

async function getNewUrls() {
  try {
    // sitemap.xml 파일을 읽어서 URL 목록을 추출
    const sitemapPath = join(process.cwd(), "dist", "sitemap.xml")

    if (!existsSync(sitemapPath)) {
      console.log("⚠️  Sitemap not found, skipping URL submission")
      return []
    }

    const sitemapContent = readFileSync(sitemapPath, "utf-8")

    // XML에서 URL을 추출하는 간단한 정규식
    const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g)

    if (!urlMatches) {
      console.log("⚠️  No URLs found in sitemap")
      return []
    }

    const urls = urlMatches.map((match) => {
      const url = match.replace(/<\/?loc>/g, "")
      return url.replace(GSC_SITE_URL, "") // 상대 경로로 변환
    })

    console.log(`📋 Found ${urls.length} URLs in sitemap`)
    return urls
  } catch (error) {
    console.error("❌ Failed to read sitemap:", error.message)
    return []
  }
}

async function submitUrlsToGSC(urls) {
  if (urls.length === 0) {
    console.log("⚠️  No URLs to submit")
    return
  }

  try {
    console.log("🚀 Submitting URLs to Google Indexing API...")

    // Google Auth 클라이언트 생성 (credentials 객체 직접 전달)
    const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS)
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    })

    console.log(`📤 Submitting ${urls.length} URLs to Google Indexing API...`)

    // Google Indexing API는 한 번에 최대 200개의 URL을 처리할 수 있습니다
    const batchSize = 200
    const batches = []

    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize))
    }

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`📤 Submitting batch ${i + 1}/${batches.length} (${batch.length} URLs)...`)

      // 배치마다 토큰을 갱신하여 만료 방지
      const client = await auth.getClient()
      const accessToken = await client.getAccessToken()

      // 각 URL을 개별적으로 제출 (Indexing API는 개별 URL 제출만 지원)
      for (const url of batch) {
        const fullUrl = `${GSC_SITE_URL}${url}`

        try {
          const response = await fetch(
            `https://indexing.googleapis.com/v3/urlNotifications:publish`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: fullUrl,
                type: "URL_UPDATED",
              }),
            },
          )

          if (!response.ok) {
            const errorText = await response.text()

            // 429 응답 시 바로 종료
            if (response.status === 429) {
              console.error(`❌ Rate limit exceeded (429). Stopping submission.`)
              console.error(`   Please wait before retrying.`)
              process.exit(0)
            }

            const errorData = JSON.parse(errorText)

            if (
              errorData.error?.code === 403 &&
              errorData.error?.message?.includes("URL ownership")
            ) {
              console.warn(`⚠️  URL ownership verification failed for ${fullUrl}`)
              console.warn(
                `   This usually means the service account doesn't have permission for this site`,
              )
              console.warn(
                `   Please ensure the service account is added as owner/full user in Google Search Console`,
              )
            } else {
              console.warn(`⚠️  Failed to submit ${fullUrl}: ${errorText}`)
            }
            errorCount++
            continue
          }

          await response.json()
          console.log(`✅ Submitted: ${fullUrl}`)
          successCount++

          // API 제한을 피하기 위해 잠시 대기
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`❌ Error submitting ${fullUrl}:`, error.message)
          errorCount++
        }
      }
    }

    console.log(`🎉 Submission completed!`)
    console.log(`✅ Successfully submitted: ${successCount} URLs`)
    if (errorCount > 0) {
      console.log(`❌ Failed to submit: ${errorCount} URLs`)
      console.log(`💡 To fix URL ownership issues:`)
      console.log(`   1. Go to Google Search Console: https://search.google.com/search-console`)
      console.log(`   2. Add your service account email as owner/full user`)
      console.log(`   3. Verify site ownership is complete`)
    }
  } catch (error) {
    console.error("❌ Failed to submit URLs:", error.message)
    process.exit(1)
  }
}

async function main() {
  const urls = await getNewUrls()
  await submitUrlsToGSC(urls)
}

main()
