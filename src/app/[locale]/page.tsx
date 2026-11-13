import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { PageMediaPreload } from "@/components/media";
import { PORCELAIN_SLAB_TEXTURES } from "@/constants/landing-hero";
import { MEDIA_PATHS } from "@/constants/media";
import { LandingPageContent } from "@/page-sections/landing/LandingPageContent";
import { buildAlternatesForLocale, buildOpenGraphForLocale, SITE_URL } from "@/constants/seo";
import { encodePublicAssetPath } from "@/lib/products/media";

interface HomePageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "meta.home" });
	const alternates = buildAlternatesForLocale("/", locale);

	return {
		title: t("title"),
		description: t("description"),
		alternates,
		openGraph: buildOpenGraphForLocale({
			title: t("ogTitle"),
			description: t("ogDescription"),
			url: alternates.canonical,
			ogLocale: t("ogLocale"),
		}),
	};
}

export default async function HomePage({ params }: HomePageProps) {
	const { locale } = await params;
	setRequestLocale(locale);

	const tCommon = await getTranslations({ locale, namespace: "common" });
	const tContact = await getTranslations({ locale, namespace: "footer.contact" });
	const tAbout = await getTranslations({ locale, namespace: "pages.about.schema" });

	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "";
	const isMobileSSR = /mobile/i.test(userAgent);

	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": `${SITE_URL}#organization`,
		name: tAbout("name"),
		description: tAbout("description"),
		slogan: tAbout("slogan"),
		url: SITE_URL,
		logo: `${SITE_URL}/logo/hungphat_ceramic_logo_big.png`,
		foundingDate: tAbout("foundingDate"),
		address: {
			"@type": "PostalAddress",
			streetAddress: tAbout("address.streetAddress"),
			addressLocality: tAbout("address.addressLocality"),
			addressCountry: tAbout("address.addressCountry"),
		},
		contactPoint: {
			"@type": "ContactPoint",
			telephone: tAbout("contact.telephone"),
			email: tAbout("contact.email"),
			contactType: tAbout("contact.contactType"),
		},
	};

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: tCommon("companyName"),
		url: `${SITE_URL}/${locale}`,
		potentialAction: {
			"@type": "SearchAction",
			target: `${SITE_URL}/${locale}/products?search={search_term_string}`,
			"query-input": "required name=search_term_string",
		},
	};

	const localBusinessSchema = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		name: tCommon("companyName"),
		image: `${SITE_URL}/logo/hungphat_ceramic_logo_big.png`,
		telephone: tContact("phone"),
		email: tContact("email"),
		address: {
			"@type": "PostalAddress",
			streetAddress: tContact("address"),
			addressLocality: "Hà Nội",
			addressCountry: "VN",
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: 21.0546308,
			longitude: 105.7979539,
		},
		url: `${SITE_URL}/${locale}`,
		priceRange: "$$$$",
	};

	const schemas = [organizationSchema, websiteSchema, localBusinessSchema];

	return (
		<main className="relative" style={{ position: "relative" }}>
			{/* Gallery poster = LCP; desktop also preloads WebGL slab textures. */}
			<PageMediaPreload imagePaths={[MEDIA_PATHS.images.landing.heroGalleryPoster]} />
			<PageMediaPreload
				desktopOnly
				imagePaths={PORCELAIN_SLAB_TEXTURES.map((path) => encodePublicAssetPath(path))}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
			/>
			<LandingPageContent isMobileSSR={isMobileSSR} />
		</main>
	);
}
