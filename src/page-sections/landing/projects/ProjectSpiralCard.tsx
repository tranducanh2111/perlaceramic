"use client";

import { ViewportDeferredImage } from "@/components/media";
import { useTranslations } from "next-intl";
import { Text } from "@/components/ui";
import { FEATURED_PROJECTS, type FeaturedProject } from "@/constants/landing";
import { cn } from "@/lib/cn";
import {
	SPIRAL_CARD_ARTICLE_CLASS,
	SPIRAL_CARD_BACK_UI,
	SPIRAL_CARD_FACE_CLIP_CLASS,
	SPIRAL_CARD_UI,
	resolveSpiralCardSize,
	type SpiralCardSize,
	type SpiralGeometry,
} from "./constants";
import { computeSpiralSlot } from "./geometry";

interface ProjectCardVisualProps {
	project: FeaturedProject;
	index: number;
	translationNamespace: string;
	layout?: "default" | "fill";
	spiralSize?: SpiralCardSize;
}

export function ProjectCardVisual({
	project,
	index,
	translationNamespace,
	layout = "default",
	spiralSize = "lg",
}: ProjectCardVisualProps) {
	const t = useTranslations("landing.projects");
	const isFillLayout = layout === "fill";
	const spiralUi = isFillLayout ? SPIRAL_CARD_UI[spiralSize] : null;

	return (
		<article
			className={cn(
				"group relative h-full",
				isFillLayout
					? SPIRAL_CARD_ARTICLE_CLASS
					: "border-champagne/15 bg-sapphire-ocean overflow-hidden rounded-[1.75rem] border shadow-[0_12px_42px_rgba(4,15,26,0.36)]",
			)}
		>
			<div
				className={cn(
					"relative h-full w-full",
					isFillLayout
						? "flex flex-col"
						: "transition-transform duration-500 ease-out group-hover:scale-[1.01]",
				)}
			>
				<div
					className={cn(
						"relative overflow-hidden",
						isFillLayout ? "min-h-0 flex-1" : "aspect-[4/3]",
					)}
				>
					<ViewportDeferredImage
						src={project.imageUrl}
						alt={t(`${translationNamespace}.imageAlt`)}
						fill
						quality={55}
						eager={index < 2}
						unloadWhenFar={!isFillLayout}
						className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
						sizes={
							spiralUi?.imageSizes ??
							"(min-width: 1024px) 420px, (min-width: 768px) 310px, 85vw"
						}
					/>
					<div className="to-[#071A2B]/08 absolute inset-0 bg-gradient-to-t from-[#071A2B]/72 via-[#071A2B]/28" />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,184,134,0.12),transparent_40%)]" />
					<div
						className={cn(
							"pointer-events-none absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-[#071A2B]/55 via-[#071A2B]/18 to-transparent",
							spiralUi?.imageFade ?? "h-[42%]",
						)}
					/>
				</div>

				<div
					className={cn(
						"pointer-events-none absolute z-10 flex items-start justify-between",
						spiralUi?.overlay ?? "top-5 right-5 left-5 gap-4",
					)}
				>
					<div
						className={cn(
							"max-w-[min(100%,calc(100%-4.5rem))] border border-white/10",
							spiralUi?.titleBox ?? "rounded-xl px-4 py-3",
							isFillLayout
								? "bg-[#071A2B]/88"
								: "bg-[#071A2B]/28 backdrop-blur-md backdrop-saturate-150",
						)}
					>
						<Text
							as="h3"
							variant={spiralUi ? spiralUi.titleVariant : "h4"}
							className={cn(
								"line-clamp-2 text-[#F4F4F6] [text-shadow:0_1px_2px_rgba(7,26,43,0.95),0_2px_24px_rgba(7,26,43,0.7)]",
								spiralSize === "md" && isFillLayout && "font-serif leading-snug",
							)}
						>
							{t(`${translationNamespace}.title`)}
						</Text>
					</div>
					<span
						className={cn(
							"shrink-0 rounded-full border border-[#D4B886]/28 font-sans text-[#D4B886] uppercase",
							spiralUi?.year ?? "text-footnote px-3 py-1.5 tracking-[0.14em]",
							isFillLayout
								? "bg-[#071A2B]/90"
								: "bg-[#071A2B]/45 backdrop-blur-md backdrop-saturate-150",
						)}
					>
						{project.year}
					</span>
				</div>

				<div className={cn("absolute z-10", spiralUi?.bottom ?? "right-5 bottom-5 left-5")}>
					<div
						className={cn(
							"border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]",
							spiralUi?.panel ?? "rounded-2xl p-5",
							isFillLayout
								? "bg-[#071A2B]/88"
								: "rounded-2xl bg-[#071A2B]/22 p-5 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 group-hover:border-white/18 group-hover:bg-[#071A2B]/30",
						)}
					>
						<Text
							variant={spiralUi ? spiralUi.metaVariant : "body-sm"}
							className="text-[#F4F4F6]/78 [text-shadow:0_1px_2px_rgba(7,26,43,0.92),0_2px_20px_rgba(7,26,43,0.65)]"
						>
							{t(`${translationNamespace}.area`)}
						</Text>
						<div
							className={cn(
								"h-px bg-gradient-to-r from-white/22 via-white/10 to-transparent",
								spiralUi?.stackGap ?? "mt-4",
							)}
						/>
						<Text
							variant={spiralUi ? spiralUi.metaVariant : "body-sm"}
							className={cn(
								"truncate font-sans text-[#F4F4F6]/82 [text-shadow:0_1px_2px_rgba(7,26,43,0.92),0_2px_18px_rgba(7,26,43,0.62)]",
								spiralUi?.stackGap ?? "mt-4",
							)}
						>
							{t(`${translationNamespace}.location`)}
						</Text>
					</div>
				</div>
			</div>
		</article>
	);
}

interface ProjectCardBackProps {
	project: FeaturedProject;
	index: number;
	translationNamespace: string;
	spiralSize: SpiralCardSize;
}

export function ProjectCardBack({
	project,
	index,
	translationNamespace,
	spiralSize,
}: ProjectCardBackProps) {
	const t = useTranslations("landing.projects");
	const backUi = SPIRAL_CARD_BACK_UI[spiralSize];

	return (
		<article className={SPIRAL_CARD_ARTICLE_CLASS}>
			<div className="relative h-full w-full">
				<div className="absolute inset-0 bg-[#0E2A42]" aria-hidden="true" />
				<ViewportDeferredImage
					src={project.imageUrl}
					alt=""
					aria-hidden
					fill
					quality={55}
					eager={index < 2}
					unloadWhenFar={false}
					className="object-cover opacity-30 saturate-50"
					sizes={SPIRAL_CARD_UI[spiralSize].imageSizes}
				/>
				<div className="absolute inset-0 bg-gradient-to-br from-[#071A2B] via-[#0E2A42]/95 to-[#1A3D5C]/90" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,184,134,0.12),transparent_50%)]" />
				<div
					className={cn(
						"flex h-full flex-col items-center justify-center text-center",
						backUi.body,
					)}
				>
					<span className={cn("font-sans text-[#D4B886]/70 uppercase", backUi.brand)}>
						Perla
					</span>
					<div
						className={cn(
							"h-px bg-gradient-to-r from-transparent via-[#D4B886]/50 to-transparent",
							backUi.divider,
						)}
					/>
					<Text variant={backUi.titleVariant} className="line-clamp-2 text-[#F4F4F6]/88">
						{t(`${translationNamespace}.title`)}
					</Text>
					<span
						className={cn(
							"font-sans tracking-[0.16em] text-[#F4F4F6]/35 uppercase tabular-nums",
							backUi.year,
						)}
					>
						{project.year}
					</span>
				</div>
			</div>
		</article>
	);
}

interface ProjectSpiralCardProps {
	project: FeaturedProject;
	index: number;
	geometry: SpiralGeometry;
}

export function ProjectSpiralCard({ project, index, geometry }: ProjectSpiralCardProps) {
	const translationNamespace = `items.${project.id}`;
	const spiralSize = resolveSpiralCardSize(geometry.cardWidth);
	const slot = computeSpiralSlot(index, FEATURED_PROJECTS.length, geometry);

	return (
		<div
			style={{
				position: "absolute",
				width: geometry.cardWidth,
				height: geometry.cardHeight,
				transform: `translate3d(${slot.x}px, ${slot.y}px, ${slot.z}px) rotateY(${slot.rotateY}deg)`,
				transformStyle: "preserve-3d",
			}}
		>
			<div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
				<div className={SPIRAL_CARD_FACE_CLIP_CLASS}>
					<ProjectCardVisual
						project={project}
						index={index}
						translationNamespace={translationNamespace}
						layout="fill"
						spiralSize={spiralSize}
					/>
				</div>
				<div
					className={cn(
						SPIRAL_CARD_FACE_CLIP_CLASS,
						"[transform:rotateY(180deg)_translateZ(0.1px)]",
					)}
				>
					<div
						className="h-full w-full [transform:rotateY(180deg)]"
						style={{ transformStyle: "flat" }}
					>
						<ProjectCardBack
							project={project}
							index={index}
							translationNamespace={translationNamespace}
							spiralSize={spiralSize}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
