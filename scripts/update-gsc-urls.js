#!/usr/bin/env node

import { unlinkSync, writeFileSync } from "node:fs"
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

// 기존 URL 구조에서 새로운 URL 구조로 매핑 (실제 카테고리 정보 기반)
const urlMappings = [
  // 한국어 포스트들
  {
    oldUrl: `${GSC_SITE_URL}/posts/experience/12th-9oormthon`,
    newUrl: `${GSC_SITE_URL}/posts/12th-9oormthon`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/cloud/amazon-q-developer-cli`,
    newUrl: `${GSC_SITE_URL}/posts/amazon-q-developer-cli`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/cloud/aws-clf-c02`,
    newUrl: `${GSC_SITE_URL}/posts/aws-clf-c02`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/blog-comment-feautre-with-fuma-comment`,
    newUrl: `${GSC_SITE_URL}/posts/blog-comment-feautre-with-fuma-comment`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/thinking/book-and-movie`,
    newUrl: `${GSC_SITE_URL}/posts/book-and-movie`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/movie/coffee-and-cigarettes`,
    newUrl: `${GSC_SITE_URL}/posts/coffee-and-cigarettes`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/dns-deepdive-1`,
    newUrl: `${GSC_SITE_URL}/posts/dns-deepdive-1`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/dns-deepdive-2`,
    newUrl: `${GSC_SITE_URL}/posts/dns-deepdive-2`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/dns-deepdive-3`,
    newUrl: `${GSC_SITE_URL}/posts/dns-deepdive-3`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/git-squash-vs-fixup`,
    newUrl: `${GSC_SITE_URL}/posts/git-squash-vs-fixup`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/lazygit-work-lazily-smartly`,
    newUrl: `${GSC_SITE_URL}/posts/lazygit-work-lazily-smartly`,
  },
  { oldUrl: `${GSC_SITE_URL}/posts/movie/midsommar`, newUrl: `${GSC_SITE_URL}/posts/midsommar` },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/migration-blog-from-nextjs-to-astro`,
    newUrl: `${GSC_SITE_URL}/posts/migration-blog-from-nextjs-to-astro`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/monorepo-storybook-composition`,
    newUrl: `${GSC_SITE_URL}/posts/monorepo-storybook-composition`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/book/process-economy`,
    newUrl: `${GSC_SITE_URL}/posts/process-economy`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/proxy-no-more-retreat`,
    newUrl: `${GSC_SITE_URL}/posts/proxy-no-more-retreat`,
  },
  { oldUrl: `${GSC_SITE_URL}/posts/movie/rashomon`, newUrl: `${GSC_SITE_URL}/posts/rashomon` },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/the-mind-behind-linux`,
    newUrl: `${GSC_SITE_URL}/posts/the-mind-behind-linux`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/posts/develop/zotero-webdav-coolify`,
    newUrl: `${GSC_SITE_URL}/posts/zotero-webdav-coolify`,
  },

  // 영어 포스트들 (영어 버전이 있는 경우)
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/experience/12th-9oormthon`,
    newUrl: `${GSC_SITE_URL}/en/posts/12th-9oormthon`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/cloud/amazon-q-developer-cli`,
    newUrl: `${GSC_SITE_URL}/en/posts/amazon-q-developer-cli`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/cloud/aws-clf-c02`,
    newUrl: `${GSC_SITE_URL}/en/posts/aws-clf-c02`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/blog-comment-feautre-with-fuma-comment`,
    newUrl: `${GSC_SITE_URL}/en/posts/blog-comment-feautre-with-fuma-comment`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/thinking/book-and-movie`,
    newUrl: `${GSC_SITE_URL}/en/posts/book-and-movie`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/movie/coffee-and-cigarettes`,
    newUrl: `${GSC_SITE_URL}/en/posts/coffee-and-cigarettes`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/dns-deepdive-1`,
    newUrl: `${GSC_SITE_URL}/en/posts/dns-deepdive-1`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/dns-deepdive-2`,
    newUrl: `${GSC_SITE_URL}/en/posts/dns-deepdive-2`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/dns-deepdive-3`,
    newUrl: `${GSC_SITE_URL}/en/posts/dns-deepdive-3`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/git-squash-vs-fixup`,
    newUrl: `${GSC_SITE_URL}/en/posts/git-squash-vs-fixup`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/lazygit-work-lazily-smartly`,
    newUrl: `${GSC_SITE_URL}/en/posts/lazygit-work-lazily-smartly`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/movie/midsommar`,
    newUrl: `${GSC_SITE_URL}/en/posts/midsommar`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/migration-blog-from-nextjs-to-astro`,
    newUrl: `${GSC_SITE_URL}/en/posts/migration-blog-from-nextjs-to-astro`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/monorepo-storybook-composition`,
    newUrl: `${GSC_SITE_URL}/en/posts/monorepo-storybook-composition`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/book/process-economy`,
    newUrl: `${GSC_SITE_URL}/en/posts/process-economy`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/proxy-no-more-retreat`,
    newUrl: `${GSC_SITE_URL}/en/posts/proxy-no-more-retreat`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/movie/rashomon`,
    newUrl: `${GSC_SITE_URL}/en/posts/rashomon`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/the-mind-behind-linux`,
    newUrl: `${GSC_SITE_URL}/en/posts/the-mind-behind-linux`,
  },
  {
    oldUrl: `${GSC_SITE_URL}/en/posts/develop/zotero-webdav-coolify`,
    newUrl: `${GSC_SITE_URL}/en/posts/zotero-webdav-coolify`,
  },
]

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
    console.log("🚀 Starting URL updates in Google Search Console...")

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
    for (const { oldUrl, newUrl } of urlMappings) {
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
    }
  } catch (error) {
    console.error("❌ Failed to update URLs in Google Search Console:", error.message)
    process.exit(1)
  }
}

// 스크립트 실행
updateAllUrlsInGSC()
