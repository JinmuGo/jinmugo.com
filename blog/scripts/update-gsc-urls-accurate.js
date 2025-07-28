#!/usr/bin/env node

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
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

// 포스트 파일에서 카테고리 정보를 추출하는 함수
function extractCategoryFromPostFile(slug) {
  try {
    const postDir = join(process.cwd(), "blog_obsidian", "post", slug)
    const mdFile = join(postDir, `${slug}.md`)
    const enMdFile = join(postDir, `${slug}.en.md`)

    let filePath = null
    if (existsSync(mdFile)) {
      filePath = mdFile
    } else if (existsSync(enMdFile)) {
      filePath = enMdFile
    }

    if (!filePath) {
      console.warn(`⚠️  Post file not found for slug: ${slug}`)
      return null
    }

    const content = readFileSync(filePath, "utf-8")

    // frontmatter에서 category 추출
    const categoryMatch = content.match(/category:\s*(\w+)/)
    if (categoryMatch) {
      return categoryMatch[1]
    }

    console.warn(`⚠️  Category not found in frontmatter for slug: ${slug}`)
    return null
  } catch (error) {
    console.error(`❌ Error reading post file for slug ${slug}:`, error.message)
    return null
  }
}

// 포스트 디렉토리 목록을 가져오는 함수
async function getPostSlugs() {
  try {
    const { readdirSync } = await import("node:fs")
    const postDir = join(process.cwd(), "blog_obsidian", "post")

    if (!existsSync(postDir)) {
      console.error("❌ Post directory not found")
      return []
    }

    const entries = readdirSync(postDir, { withFileTypes: true })
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  } catch (error) {
    console.error("❌ Error reading post directory:", error.message)
    return []
  }
}

// 정확한 URL 매핑을 생성하는 함수
async function generateAccurateUrlMappings() {
  const postSlugs = await getPostSlugs()
  console.log(`📋 Found ${postSlugs.length} post directories`)

  const urlMappings = []

  for (const slug of postSlugs) {
    const category = extractCategoryFromPostFile(slug)

    if (category) {
      // 한국어 포스트
      urlMappings.push({
        oldUrl: `${GSC_SITE_URL}/posts/${category}/${slug}`,
        newUrl: `${GSC_SITE_URL}/posts/${slug}`,
        slug,
        category,
        isEnglish: false,
      })

      // 영어 포스트 (영어 버전이 있는지 확인)
      const enMdFile = join(process.cwd(), "blog_obsidian", "post", slug, `${slug}.en.md`)
      if (existsSync(enMdFile)) {
        urlMappings.push({
          oldUrl: `${GSC_SITE_URL}/en/posts/${category}/${slug}`,
          newUrl: `${GSC_SITE_URL}/en/posts/${slug}`,
          slug,
          category,
          isEnglish: true,
        })
      }
    } else {
      console.warn(`⚠️  Skipping ${slug} - category not found`)
    }
  }

  return urlMappings
}

async function updateUrlInGSC(auth, oldUrl, newUrl) {
  try {
    console.log(`🔄 Updating URL in Google Search Console...`)
    console.log(`   Old: ${oldUrl}`)
    console.log(`   New: ${newUrl}`)

    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    // Google Search Console URL 변경 API 호출
    // 참고: GSC는 직접적인 URL 변경 API를 제공하지 않으므로,
    // 새로운 URL을 제출하고 기존 URL을 삭제하는 방식으로 처리

    // 1. 새로운 URL을 GSC에 제출
    const submitResponse = await fetch(
      `https://indexing.googleapis.com/v3/urlNotifications:publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: newUrl,
          type: "URL_UPDATED",
        }),
      },
    )

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      console.warn(`⚠️  Failed to submit new URL ${newUrl}: ${errorText}`)
      return false
    }

    console.log(`✅ New URL submitted successfully: ${newUrl}`)

    // 2. 기존 URL을 삭제 요청 (URL_DELETED 타입으로 제출)
    const deleteResponse = await fetch(
      `https://indexing.googleapis.com/v3/urlNotifications:publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: oldUrl,
          type: "URL_DELETED",
        }),
      },
    )

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text()
      console.warn(`⚠️  Failed to delete old URL ${oldUrl}: ${errorText}`)
      // 새로운 URL은 성공했으므로 true 반환
      return true
    }

    console.log(`✅ Old URL deleted successfully: ${oldUrl}`)
    return true
  } catch (error) {
    console.error(`❌ Error updating URL ${oldUrl} -> ${newUrl}:`, error.message)
    return false
  }
}

async function updateAllUrlsInGSC() {
  try {
    console.log("🚀 Starting accurate URL updates in Google Search Console...")

    // 정확한 URL 매핑 생성
    const urlMappings = await generateAccurateUrlMappings()
    console.log(`📋 Generated ${urlMappings.length} accurate URL mappings`)

    if (urlMappings.length === 0) {
      console.log("⚠️  No URL mappings to process")
      return
    }

    // 매핑 정보 출력
    console.log("\n📝 URL Mappings:")
    urlMappings.forEach(({ slug, category, isEnglish, oldUrl, newUrl }) => {
      console.log(`   ${slug} (${category}) ${isEnglish ? "[EN]" : "[KO]"}`)
      console.log(`     ${oldUrl} -> ${newUrl}`)
    })

    // 서비스 계정 JSON 키를 임시 파일로 저장
    const tempKeyPath = join(process.cwd(), "temp-service-account.json")
    writeFileSync(tempKeyPath, GOOGLE_APPLICATION_CREDENTIALS)

    // Google Auth 클라이언트 생성
    const auth = new GoogleAuth({
      keyFile: tempKeyPath,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    })

    let successCount = 0
    let failureCount = 0

    // 각 URL 매핑을 순차적으로 처리
    for (const { oldUrl, newUrl, slug, category, isEnglish } of urlMappings) {
      console.log(`\n📝 Processing: ${slug} (${category}) ${isEnglish ? "[EN]" : "[KO]"}`)

      const success = await updateUrlInGSC(auth, oldUrl, newUrl)
      if (success) {
        successCount++
      } else {
        failureCount++
      }

      // API 제한을 피하기 위해 요청 간 간격을 둠
      console.log("⏳ Waiting 1 second before next update...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // 임시 파일 삭제
    try {
      unlinkSync(tempKeyPath)
    } catch {
      // 무시
    }

    // 최종 결과 요약
    console.log("\n📊 Final Results:")
    console.log(`✅ Successfully updated: ${successCount} URLs`)
    console.log(`❌ Failed updates: ${failureCount} URLs`)
    console.log(`📈 Total attempted: ${urlMappings.length}`)

    if (failureCount > 0) {
      console.log("\n⚠️  Some updates failed. Check the logs above for details.")
      process.exit(1)
    } else {
      console.log("\n🎉 All URL updates completed successfully!")
      console.log("\n💡 Next steps:")
      console.log("1. Check Google Search Console to verify the changes")
      console.log("2. Monitor your site's search performance")
      console.log("3. Consider setting up 301 redirects for old URLs if needed")
      console.log("4. Update any internal links that still point to old URLs")
    }
  } catch (error) {
    console.error("❌ Failed to update URLs in Google Search Console:", error.message)
    process.exit(1)
  }
}

// 스크립트 실행
updateAllUrlsInGSC()
