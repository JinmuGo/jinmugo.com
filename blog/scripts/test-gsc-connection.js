#!/usr/bin/env node

import { unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GoogleAuth } from "google-auth-library";

const GOOGLE_APPLICATION_CREDENTIALS =
	process.env.GOOGLE_APPLICATION_CREDENTIALS;
const GSC_SITE_URL = process.env.GSC_SITE_URL;
const GSC_PROPERTY_ID = process.env.GSC_PROPERTY_ID;

if (!GOOGLE_APPLICATION_CREDENTIALS || !GSC_SITE_URL || !GSC_PROPERTY_ID) {
	console.error("❌ Missing required environment variables:");
	console.error("   - GOOGLE_APPLICATION_CREDENTIALS");
	console.error("   - GSC_SITE_URL");
	console.error("   - GSC_PROPERTY_ID");
	process.exit(1);
}

async function testGSCConnection() {
	try {
		console.log("🔍 Testing Google Search Console connection...");
		console.log(`📊 Site URL: ${GSC_SITE_URL}`);
		console.log(`📊 Property ID: ${GSC_PROPERTY_ID}`);

		// 서비스 계정 JSON 키를 임시 파일로 저장
		const tempKeyPath = join(process.cwd(), "temp-service-account.json");
		writeFileSync(tempKeyPath, GOOGLE_APPLICATION_CREDENTIALS);

		// Google Auth 클라이언트 생성
		const auth = new GoogleAuth({
			keyFile: tempKeyPath,
			scopes: [
				"https://www.googleapis.com/auth/indexing",
				"https://www.googleapis.com/auth/webmasters",
			],
		});

		const client = await auth.getClient();
		const accessToken = await client.getAccessToken();

		console.log("✅ Access token generated successfully");

		// 1. 사이트 목록 조회 테스트
		console.log("\n🔍 Testing site list...");
		const sitesResponse = await fetch(
			"https://searchconsole.googleapis.com/v3/sites",
			{
				headers: {
					Authorization: `Bearer ${accessToken.token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!sitesResponse.ok) {
			const errorText = await sitesResponse.text();
			throw new Error(
				`Sites API failed: HTTP ${sitesResponse.status}: ${errorText}`,
			);
		}

		const sites = await sitesResponse.json();
		console.log("✅ Sites API working");
		console.log("📋 Available sites:");
		sites.siteEntry?.forEach((site) => {
			console.log(`   - ${site.siteUrl} (${site.permissionLevel})`);
		});

		// 2. 특정 사이트 정보 조회 테스트
		console.log(`\n🔍 Testing site info for: ${GSC_PROPERTY_ID}`);
		const siteResponse = await fetch(
			`https://searchconsole.googleapis.com/v3/sites/${encodeURIComponent(GSC_PROPERTY_ID)}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken.token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!siteResponse.ok) {
			const errorText = await siteResponse.text();
			console.log(
				`⚠️  Site info failed: HTTP ${siteResponse.status}: ${errorText}`,
			);

			// 다른 형식으로 시도
			console.log("\n🔍 Trying alternative property ID format...");
			const altPropertyId = GSC_SITE_URL;
			const altSiteResponse = await fetch(
				`https://searchconsole.googleapis.com/v3/sites/${encodeURIComponent(altPropertyId)}`,
				{
					headers: {
						Authorization: `Bearer ${accessToken.token}`,
						"Content-Type": "application/json",
					},
				},
			);

			if (!altSiteResponse.ok) {
				const altErrorText = await altSiteResponse.text();
				console.log(
					`⚠️  Alternative format also failed: HTTP ${altSiteResponse.status}: ${altErrorText}`,
				);
			} else {
				const altSiteInfo = await altSiteResponse.json();
				console.log("✅ Alternative format works!");
				console.log("📊 Site info:", JSON.stringify(altSiteInfo, null, 2));
			}
		} else {
			const siteInfo = await siteResponse.json();
			console.log("✅ Site info retrieved successfully");
			console.log("📊 Site info:", JSON.stringify(siteInfo, null, 2));
		}

		// 임시 파일 삭제
		try {
			unlinkSync(tempKeyPath);
		} catch {
			// 무시
		}
	} catch (error) {
		console.error("❌ Test failed:", error.message);
		process.exit(1);
	}
}

testGSCConnection();
