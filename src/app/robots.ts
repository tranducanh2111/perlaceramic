import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/seo";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/_next/", "/api/"],
			},
			{
				userAgent: "Googlebot",
				allow: "/",
				disallow: ["/api/"],
			},
			{
				userAgent: "Google-Extended",
				allow: "/",
			},
			{
				userAgent: "GPTBot",
				allow: "/",
			},
			{
				userAgent: "ClaudeBot",
				allow: "/",
			},
			{
				userAgent: "PerplexityBot",
				allow: "/",
			},
		],
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
