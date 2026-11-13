"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Text } from "@/components/ui";
import { type MaterialCategory } from "@/constants/landing";
import { productsWithCollection } from "@/constants/routes";
import { getMaterialBackdrop, type TileSize } from "@/data/landing/material-backdrops";
import { cn } from "@/lib/cn";
import { MaterialTilePreview } from "@/components/3d/MaterialTilePreview";
import { Link } from "@/i18n/navigation";

const CARD_HOVER_TRANSITION_CLASS = "duration-[550ms] ease-[cubic-bezier(0.4,0,0.2,1)]";

interface MaterialCardProps {
	category: MaterialCategory;
}

export function MaterialCard({ category }: MaterialCardProps) {
	const t = useTranslations("landing.materials");
	
	// Show only the first tile preview for a clean, uniform card appearance.
	const tilePreview = [category.previews[0]];
	const mainSize = (category.previews[0]?.size ?? "60×120cm") as TileSize;
	const backdrop = getMaterialBackdrop(category.id, mainSize);
	const collectionHref = productsWithCollection(category.id);

	return (
		<Link
			href={collectionHref}
			className="group relative block min-h-56 overflow-hidden rounded-2xl"
		>
			<div
				className="absolute inset-0 z-0 transition-[background] duration-700 ease-out"
				style={{ background: backdrop }}
			/>

			{/* Depth + text legibility */}
			<div
				className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#071A2B]/88 via-[#071A2B]/12 to-[#040F1A]/35"
				aria-hidden="true"
			/>

			<MaterialTilePreview previews={tilePreview} />

			{/* Hover shimmer */}
			<div
				className={cn(
					"bg-champagne/0 group-hover:bg-champagne/5 group-active:bg-champagne/8 absolute inset-0 transition-colors",
					CARD_HOVER_TRANSITION_CLASS,
				)}
			/>

			{/* Border ring (no transition, ring = box-shadow; animating it is expensive). */}
			<div className="absolute inset-0 z-[8] rounded-2xl ring-1 ring-[#D4B886]/10 group-hover:ring-[#D4B886]/30 group-active:ring-[#D4B886]/45" />

			{/* Content */}
			<div className="relative z-10 flex min-h-56 flex-col justify-between p-7">
				<div>
					<Text variant="label" className="text-champagne tracking-widest uppercase">
						{category.sizes.join(" · ")}
					</Text>
					<Text as="h3" variant="h4" className="text-linen mt-3">
						{t(`categories.${category.id}.name`)}
					</Text>
					<Text variant="body-sm" className="text-linen/55 mt-2">
						{t(`categories.${category.id}.tagline`)}
					</Text>
				</div>

				<span
					className={cn(
						"text-body-sm text-champagne inline-flex items-center gap-2 font-sans opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-active:opacity-100",
						CARD_HOVER_TRANSITION_CLASS,
					)}
				>
					{t("discover")} <ArrowRight className="h-4 w-4" />
				</span>
			</div>
		</Link>
	);
}
