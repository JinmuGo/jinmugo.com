import siteMetadata from "@/consts";

export interface ListItem {
	"@type": "ListItem";
	url: string;
	position: number;
	item: {
		"@type": "Article" | "Collection" | "CreativeWork";
		name: string;
		url: string;
		description?: string;
	};
}

export interface PageSchemaOptions {
	type?:
		| "WebPage"
		| "AboutPage"
		| "CheckoutPage"
		| "CollectionPage"
		| "MediaGallery"
		| "ImageGallery"
		| "VideoGallery"
		| "ContactPage"
		| "FAQPage"
		| "ItemPage"
		| "MedicalWebPage"
		| "ProfilePage"
		| "QAPage"
		| "RealEstateListing"
		| "SearchResultsPage";
	title: string;
	description: string;
	url: string;
	imageUrl?: string;
	keywords?: string;
	inLanguage?: string;
	itemListElements?: ListItem[];
	extra?: Record<string, unknown>;
}

export const generateStructuredData = <T extends Record<string, unknown>>(
	data: T,
) => ({
	"@context": "https://schema.org",
	...data,
});

// 기본 페이지 스키마 생성 함수
export const generatePageSchema = (options: PageSchemaOptions) => {
	const {
		type = "WebPage",
		title,
		description,
		url,
		imageUrl,
		keywords,
		inLanguage = "ko",
		itemListElements,
		extra = {},
	} = options;

	// 기본 WebPage 객체
	const pageSchema: Record<string, unknown> = {
		"@type": type,
		name: title,
		description,
		url,
		inLanguage,
		keywords,
		...extra,
	};

	if (imageUrl) {
		pageSchema.image = {
			"@type": "ImageObject",
			url: imageUrl,
		};
	}

	// 공통 publisher 정보 추가
	pageSchema.publisher = {
		"@type": "Organization",
		name: siteMetadata.title,
	};

	// 목록 페이지라면, itemListElements 옵션이 있을 경우 ItemList 스키마를 mainEntity에 포함
	if (itemListElements && itemListElements.length > 0) {
		pageSchema.mainEntity = {
			"@type": "ItemList",
			itemListElement: itemListElements.map((item) => ({
				...item,
				"@type": "ListItem",
			})),
		};
	}

	return generateStructuredData(pageSchema);
};

// Posts 페이지 전용 스키마 생성 함수
export const generatePostsPageSchema = (
	options: Omit<PageSchemaOptions, "type">,
) => {
	return generatePageSchema({ ...options, type: "CollectionPage" });
};

// URL 빌더 함수들
export const buildPageUrl = (basePath: string, path: string) => {
	return `${basePath}${path}`.toLowerCase();
};

export const buildItemUrl = (url: string) => {
	return url.toLowerCase();
};
