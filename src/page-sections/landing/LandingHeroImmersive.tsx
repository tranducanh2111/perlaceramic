"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { DESKTOP_LAYOUT_QUERY } from "@/constants/breakpoints";
import { LANDING_HERO_SCROLL_HEIGHT_VH } from "@/constants/landing-hero";
import { MEDIA_PATHS } from "@/constants/media";
import { ROUTES } from "@/constants/routes";
import { useHeroCursorAmbience } from "@/hooks/useHeroCursorAmbience";
import { useIsClient } from "@/hooks/useIsClient";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

/** Desktop GSAP/WebGL — never in the mobile or first-paint bundle. */
const LandingHeroDesktopEnhancements = dynamic(
	() =>
		import("@/page-sections/landing/LandingHeroDesktopEnhancements").then((module) => ({
			default: module.LandingHeroDesktopEnhancements,
		})),
	{ ssr: false },
);

function ArrowGlyph({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
			className={cn("h-3.5 w-3.5", className)}
		>
			<path
				d="M3 8h10M9 4l4 4-4 4"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

/** CSS char stagger — same visual as SplitText without GSAP on the critical path. */
function HeroCharLine({
	text,
	className,
	baseDelayMs,
	as: Tag = "span",
}: {
	text: string;
	className?: string;
	baseDelayMs: number;
	as?: "span" | "em";
}) {
	return (
		<Tag className={cn("block", className)} aria-hidden="true">
			{Array.from(text).map((character, index) => (
				<span
					key={`${character}-${index}`}
					className="landing-hero-char inline-block will-change-transform"
					style={{ animationDelay: `${baseDelayMs + index * 26}ms` }}
				>
					{character === " " ? "\u00A0" : character}
				</span>
			))}
		</Tag>
	);
}

interface LandingHeroImmersiveProps {
	isMobileSSR?: boolean;
}

interface HeroCopyProps {
	brandMark: string;
	atelier: string;
	galleryMetaLine1: string;
	galleryMetaLine2: string;
	chapterIndex: string;
	titleLine1: string;
	titleLine2: string;
	description: ReactNode;
	primaryCta: string;
	secondaryCta: string;
	scrollLabel: string;
	prefersReducedMotion: boolean;
	railRef?: React.RefObject<HTMLDivElement | null>;
	atelierRef?: React.RefObject<HTMLParagraphElement | null>;
	descriptionRef?: React.RefObject<HTMLDivElement | null>;
	actionsRef?: React.RefObject<HTMLDivElement | null>;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
}

function HeroAtelierCopy({
	brandMark,
	atelier,
	galleryMetaLine1,
	galleryMetaLine2,
	chapterIndex,
	titleLine1,
	titleLine2,
	description,
	primaryCta,
	secondaryCta,
	scrollLabel,
	prefersReducedMotion,
	railRef,
	atelierRef,
	descriptionRef,
	actionsRef,
	scrollRef,
}: HeroCopyProps) {
	const line1Delay = prefersReducedMotion ? 400 : 1750;
	const line2Delay = prefersReducedMotion ? 480 : 1980;

	return (
		<div className="relative flex h-full min-h-[100dvh] w-full flex-col justify-between px-5 py-24 sm:px-8 sm:py-28 lg:px-14 lg:py-16 xl:px-20">
			<div className="flex items-start justify-between gap-6">
				<div ref={railRef} className="landing-hero-rise landing-hero-rise--rail flex items-center gap-4">
					<span className="font-serif text-[1.65rem] leading-none tracking-[0.08em] text-champagne uppercase sm:text-[1.85rem]">
						{brandMark}
					</span>
					<span className="bg-champagne/50 hidden h-px w-10 sm:block" aria-hidden="true" />
					<p
						ref={atelierRef}
						className="text-footnote text-linen/45 hidden tracking-[0.22em] uppercase sm:block"
					>
						{atelier}
					</p>
				</div>
				<p
					className="text-footnote text-linen/35 max-w-[9rem] text-right tracking-[0.18em] uppercase"
					aria-hidden="true"
				>
					{galleryMetaLine1}
					<br />
					{galleryMetaLine2}
				</p>
			</div>

			<div className="relative z-10 flex max-w-3xl flex-col items-start text-left lg:max-w-[46rem]">
				<h1
					className="text-display-xl xl:text-display-2xl text-linen font-serif leading-[0.95] font-light tracking-[-0.03em]"
					aria-label={`${titleLine1} ${titleLine2}`}
				>
					<HeroCharLine text={titleLine1} baseDelayMs={line1Delay} />
					<HeroCharLine
						text={titleLine2}
						baseDelayMs={line2Delay}
						as="em"
						className="text-champagne mt-1 font-serif italic"
					/>
				</h1>

				<div
					ref={descriptionRef}
					className="landing-hero-rise landing-hero-rise--copy text-body-lg text-linen/68 mt-8 max-w-md font-sans leading-relaxed sm:mt-10"
				>
					{description}
				</div>

				<div
					ref={actionsRef}
					className="landing-hero-rise landing-hero-rise--actions mt-10 flex w-full flex-col gap-3 sm:mt-12 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
				>
					<Button
						href={ROUTES.projects}
						size="lg"
						className="group inline-flex items-center gap-3 !pr-2.5"
					>
						<span>{primaryCta}</span>
						<span className="bg-sapphire-deep/12 text-sapphire-deep flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-active:scale-95">
							<ArrowGlyph />
						</span>
					</Button>
					<Button
						href={ROUTES.products}
						variant="secondary"
						size="lg"
						className="border-linen/18 hover:border-champagne/60"
					>
						{secondaryCta}
					</Button>
				</div>
			</div>

			<div ref={scrollRef} className="landing-hero-rise landing-hero-rise--scroll flex items-end justify-between gap-6">
				<div className="flex items-center gap-4">
					<span className="bg-champagne/70 relative h-12 w-px overflow-hidden">
						<span className="landing-hero-scroll-pulse bg-linen absolute inset-x-0 top-0 h-1/2" />
					</span>
					<span className="text-footnote text-linen/50 tracking-[0.28em] uppercase">
						{scrollLabel}
					</span>
				</div>
				<span
					className="text-footnote text-linen/30 hidden tracking-[0.2em] tabular-nums uppercase md:block"
					aria-hidden="true"
				>
					{chapterIndex}
				</span>
			</div>
		</div>
	);
}

function ArchitecturalFrame() {
	const corner =
		"pointer-events-none absolute h-8 w-8 border-champagne/35 sm:h-10 sm:w-10";
	return (
		<div className="pointer-events-none absolute inset-5 z-[15] sm:inset-7 lg:inset-10" aria-hidden="true">
			<span className={cn(corner, "top-0 left-0 border-t border-l")} />
			<span className={cn(corner, "top-0 right-0 border-t border-r")} />
			<span className={cn(corner, "bottom-0 left-0 border-b border-l")} />
			<span className={cn(corner, "right-0 bottom-0 border-r border-b")} />
		</div>
	);
}

/**
 * Immersive porcelain gallery hero.
 * Critical path is CSS + poster only; desktop GSAP/WebGL enhance after input.
 */
export function LandingHeroImmersive({ isMobileSSR }: LandingHeroImmersiveProps) {
	const t = useTranslations("landing.hero");
	const prefersReducedMotion = usePrefersReducedMotion();
	const isDesktopHero = useMediaQuery(DESKTOP_LAYOUT_QUERY, !isMobileSSR);
	const hasFinePointer = useMediaQuery("(pointer: fine)", true);
	const useDesktopMotion = isDesktopHero && !prefersReducedMotion;
	const enableCursorAmbience = isDesktopHero && !prefersReducedMotion && hasFinePointer;

	const sectionRef = useRef<HTMLElement>(null);
	const pinRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLDivElement>(null);
	const canvasWrapRef = useRef<HTMLDivElement>(null);
	const cursorGlowRef = useRef<HTMLDivElement>(null);
	const railRef = useRef<HTMLDivElement>(null);
	const atelierRef = useRef<HTMLParagraphElement>(null);
	const descriptionRef = useRef<HTMLDivElement>(null);
	const actionsRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const scrollProgressRef = useRef(0);
	const mouseRef = useRef({ x: 0, y: 0 });
	const isPointerOverRef = useRef(false);
	const introCompleteRef = useRef(false);
	const resetAmbienceRef = useRef<() => void>(() => undefined);
	const [isSceneActive, setIsSceneActive] = useState(true);
	const isClient = useIsClient();
	const isCursorAmbienceReady = isClient && enableCursorAmbience;

	const { handlePointerMove, handlePointerLeave, resetAmbience } = useHeroCursorAmbience({
		enabled: isCursorAmbienceReady,
		pinRef,
		coordinateRef: canvasWrapRef,
		cursorGlowRef,
		contentRef,
		mouseRef,
		scrollProgressRef,
		introCompleteRef,
	});

	useEffect(() => {
		resetAmbienceRef.current = resetAmbience;
	}, [resetAmbience]);

	/** Mark CSS intro complete for cursor ambience; match prior GSAP timeline length. */
	useEffect(() => {
		const timeoutId = window.setTimeout(
			() => {
				introCompleteRef.current = true;
			},
			prefersReducedMotion ? 900 : 2800,
		);
		return () => window.clearTimeout(timeoutId);
	}, [prefersReducedMotion]);

	/** Warm the desktop WebGL/GSAP chunk as soon as we know this viewport needs it. */
	useEffect(() => {
		if (!useDesktopMotion) {
			return;
		}
		void import("@/page-sections/landing/LandingHeroDesktopEnhancements");
	}, [useDesktopMotion]);

	const onHeroPointerEnter = useCallback(() => {
		isPointerOverRef.current = true;
	}, []);

	const onHeroPointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			isPointerOverRef.current = true;
			handlePointerMove(event);
		},
		[handlePointerMove],
	);

	const onHeroPointerLeave = useCallback(() => {
		isPointerOverRef.current = false;
		handlePointerLeave();
	}, [handlePointerLeave]);

	const description = (
		<>
			{t("descriptionLine1")}
			<br />
			{t("descriptionLine2")}
		</>
	);

	return (
		<section
			ref={sectionRef}
			className="bg-sapphire-deep relative isolate w-full overflow-hidden"
			style={{ height: useDesktopMotion ? `${LANDING_HERO_SCROLL_HEIGHT_VH}vh` : "100dvh" }}
			aria-label={`${t("titleLine1")} ${t("titleLine2")}`}
		>
			<div
				ref={pinRef}
				className={cn(
					"relative h-[100dvh] w-full overflow-hidden lg:h-screen",
					// Sticky approximates the GSAP pin before the desktop chunk loads.
					useDesktopMotion && "sticky top-0 z-[1]",
				)}
				onPointerEnter={isDesktopHero ? onHeroPointerEnter : undefined}
				onPointerMove={isDesktopHero ? onHeroPointerMove : undefined}
				onPointerLeave={isDesktopHero ? onHeroPointerLeave : undefined}
			>
				<div ref={backdropRef} className="absolute inset-0 z-0">
					<div
						ref={canvasWrapRef}
						className={cn(
							"landing-hero-media absolute inset-0 overflow-hidden will-change-transform",
							!prefersReducedMotion && "landing-hero-media--zoom",
						)}
					>
						{/* Poster only for LCP / mobile — desktop WebGL mounts with the hero, not after. */}
						<Image
							src={MEDIA_PATHS.images.landing.heroGalleryPoster}
							alt={t("titleLine1")}
							fill
							priority
							sizes="100vw"
							className="object-cover object-center"
						/>
						{useDesktopMotion && (
							<LandingHeroDesktopEnhancements
								sectionRef={sectionRef}
								pinRef={pinRef}
								contentRef={contentRef}
								backdropRef={backdropRef}
								canvasWrapRef={canvasWrapRef}
								scrollProgressRef={scrollProgressRef}
								mouseRef={mouseRef}
								isPointerOverRef={isPointerOverRef}
								introCompleteRef={introCompleteRef}
								resetAmbienceRef={resetAmbienceRef}
								isSceneActive={isSceneActive}
								onSceneActiveChange={setIsSceneActive}
							/>
						)}
					</div>

					<div
						className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sapphire-deep/88 via-sapphire-deep/45 to-sapphire-deep/15 sm:via-sapphire-deep/35"
						aria-hidden="true"
					/>
					<div
						className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sapphire-deep/80 via-transparent to-sapphire-deep/50"
						aria-hidden="true"
					/>
				</div>

				{isCursorAmbienceReady && (
					<div
						ref={cursorGlowRef}
						className="pointer-events-none absolute top-0 left-0 z-[2] h-[min(42vw,520px)] w-[min(42vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,184,134,0.16)_0%,rgba(212,184,134,0.05)_40%,transparent_70%)] opacity-0 will-change-transform"
						aria-hidden="true"
					/>
				)}

				<div
					className="landing-hero-film-grain pointer-events-none absolute inset-0 z-[12]"
					aria-hidden="true"
				/>

				<ArchitecturalFrame />

				<div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
					<div className="landing-hero-letterbox landing-hero-letterbox--top bg-sapphire-deep absolute inset-x-0 top-0 h-1/2 origin-top" />
					<div className="landing-hero-letterbox landing-hero-letterbox--bottom bg-sapphire-deep absolute inset-x-0 bottom-0 h-1/2 origin-bottom" />
				</div>

				<div ref={contentRef} className="relative z-20 h-full w-full">
					<HeroAtelierCopy
						brandMark={t("brandMark")}
						atelier={t("atelier")}
						galleryMetaLine1={t("galleryMetaLine1")}
						galleryMetaLine2={t("galleryMetaLine2")}
						chapterIndex={t("chapterIndex")}
						titleLine1={t("titleLine1")}
						titleLine2={t("titleLine2")}
						description={description}
						primaryCta={t("primaryCta")}
						secondaryCta={t("secondaryCta")}
						scrollLabel={t("scroll")}
						prefersReducedMotion={prefersReducedMotion}
						railRef={railRef}
						atelierRef={atelierRef}
						descriptionRef={descriptionRef}
						actionsRef={actionsRef}
						scrollRef={scrollRef}
					/>
				</div>
			</div>
		</section>
	);
}
