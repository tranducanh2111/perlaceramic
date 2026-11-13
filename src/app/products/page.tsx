import { permanentRedirect } from "next/navigation";
import { routing } from "@/i18n/routing";

interface ProductsRedirectPageProps {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsRedirectPage({ searchParams }: ProductsRedirectPageProps) {
	const params = searchParams ? await searchParams : {};
	const queryString = new URLSearchParams(
		Object.entries(params).flatMap(([key, val]) =>
			Array.isArray(val) ? val.map((v) => [key, v]) : val ? [[key, val]] : [],
		),
	).toString();
	const destination = queryString
		? `/${routing.defaultLocale}/products?${queryString}`
		: `/${routing.defaultLocale}/products`;
	permanentRedirect(destination);
}
