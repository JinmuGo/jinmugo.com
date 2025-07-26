interface Analytics {
	umamiAnalytics: {
		umamiWebsiteId: string | undefined;
	};
	googleAnalytics: {
		googleAnalyticsId: string;
	};
}

interface SiteMetadata {
	title: string;
	author: string;
	description: string;
	language: string;
	theme: string;
	siteUrl: string;
	cdnUrl: string;
	siteRepo: string;
	email: string;
	youtube?: string;
	mastodon?: string;
	twitter?: string;
	github: string;
	x?: string;
	bluesky?: string;
	instagram?: string;
	threads?: string;
	medium?: string;
	facebook?: string;
	linkedin?: string;
	locale: string;
	stickyNav: boolean;
	analytics: Analytics;
}

const siteMetadata: SiteMetadata = {
	title: "Thing's of my life",
	author: "Jinmu Go",
	description: "A Smooth Sea Never Made a Skilled Sailor",
	language: "ko",
	theme: "system", // system, dark or light
	siteUrl: "https://jinmu.me",
	cdnUrl: "https://cdn.jinmu.me",
	siteRepo: "https://github.com/jinmugo/jinmu.me",
	email: "hi@jinmu.me",
	github: "https://github.com/JinmuGo",
	linkedin: "https://www.linkedin.com/in/jinmugo",
	locale: "ko",
	stickyNav: true,
	analytics: {
		umamiAnalytics: {
			umamiWebsiteId: process.env.UMAMI_ID,
		},
		googleAnalytics: {
			googleAnalyticsId: "G-9KF02CPGM3",
		},
	},
};

export default siteMetadata;
