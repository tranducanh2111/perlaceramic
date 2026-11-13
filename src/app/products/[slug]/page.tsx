import { permanentRedirect } from "next/navigation";
import { routing } from "@/i18n/routing";

interface ProductDetailRedirectPageProps {
	params: Promise<{ slug: string }>;
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductDetailRedirectPage({
	params,
	searchParams,
}: ProductDetailRedirectPageProps) {
	const { slug } = await params;
	const resolvedSearchParams = searchParams ? await searchParams : {};
	const queryString = new URLSearchParams(
		Object.entries(resolvedSearchParams).flatMap(([key, val]) =>
			Array.isArray(val) ? val.map((v) => [key, v]) : val ? [[key, val]] : [],
		),
	).toString();
	const destination = queryString
		? `/${routing.defaultLocale}/products/${slug}?${queryString}`
		: `/${routing.defaultLocale}/products/${slug}`;
	permanentRedirect(destination);
}
