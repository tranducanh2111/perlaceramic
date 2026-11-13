"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui";
import { DESKTOP_LAYOUT_QUERY } from "@/constants/breakpoints";
import { LANDING_HERO_SCROLL_HEIGHT_VH } from "@/constants/landing-hero";
import { MEDIA_PATHS } from "@/constants/media";
import { ROUTES } from "@/constants/routes";
import { useGsapLenisSync } from "@/hooks/useGsapLenisSync";
import { useHeroCursorAmbience } from "@/hooks/useHeroCursorAmbience";
import { useIsClient } from "@/hooks/useIsClient";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, registerGsapPlugins, ScrollTrigger, SplitText } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/** Boot WebGL after first paint — idle or first input — so the 3D gallery is the hero, not a video. */
const WEBGL_IDLE_TIMEOUT_MS = 1100;
const GSAP_INIT_DEFER_MS = 60;

const PorcelainGalleryScene = dynamic(
	() =>
		import("@/components/3d/PorcelainGalleryScene").then((module) => ({
			default: module.PorcelainGalleryScene,
		})),
	{ ssr: false },
);

function scheduleHeroWebGLMount(onMount: () => void): () => void {
	let hasMounted = false;
	let idleCallbackId: number | null = null;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const cleanup = () => {
		window.removeEventListener("pointerdown", runMount);
		window.removeEventListener("pointermove", runMount);
		window.removeEventListener("scroll", runMount);
		window.removeEventListener("keydown", runMount);
		window.removeEventListener("touchstart", runMount);
		window.removeEventListener("wheel", runMount);
		if (idleCallbackId !== null && typeof window.cancelIdleCallback === "function") {
			window.cancelIdleCallback(idleCallbackId);
		}
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}
	};

	const runMount = () => {
		if (hasMounted) {
			return;
		}
		hasMounted = true;
		cleanup();
		onMount();
	};

	window.addEventListener("pointerdown", runMount, { passive: true });
	window.addEventListener("pointermove", runMount, { passive: true });
	window.addEventListener("scroll", runMount, { passive: true });
	window.addEventListener("keydown", runMount);
	window.addEventListener("touchstart", runMount, { passive: true });
	window.addEventListener("wheel", runMount, { passive: true });

	if (typeof window.requestIdleCallback === "function") {
		idleCallbackId = window.requestIdleCallback(runMount, {
			timeout: WEBGL_IDLE_TIMEOUT_MS,
		});
	} else {
		timeoutId = setTimeout(runMount, WEBGL_IDLE_TIMEOUT_MS);
	}

	return cleanup;
}

function scheduleGsapReady(onReady: () => void): () => void {
	const timeoutId = setTimeout(onReady, GSAP_INIT_DEFER_MS);
	return () => clearTimeout(timeoutId);
}

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
	railRef?: React.RefObject<HTMLDivElement | null>;
	atelierRef?: React.RefObject<HTMLParagraphElement | null>;
	titleLine1Ref?: React.RefObject<HTMLSpanElement | null>;
	titleLine2Ref?: React.RefObject<HTMLElement | null>;
	descriptionRef?: React.RefObject<HTMLDivElement | null>;
	actionsRef?: React.RefObject<HTMLDivElement | null>;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
}

/** Asymmetrical atelier composition — brand lives in the rail + display type, never a kicker. */
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
	railRef,
	atelierRef,
	titleLine1Ref,
	titleLine2Ref,
	descriptionRef,
	actionsRef,
	scrollRef,
}: HeroCopyProps) {
	return (
		<div className="relative flex h-full min-h-[100dvh] w-full flex-col justify-between px-5 py-24 sm:px-8 sm:py-28 lg:px-14 lg:py-16 xl:px-20">
			{/* Top meta row */}
			<div className="flex items-start justify-between gap-6">
				<div ref={railRef} className="flex items-center gap-4">
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

			{/* Primary stage — left-weighted editorial block */}
			<div className="relative z-10 flex max-w-3xl flex-col items-start text-left lg:max-w-[46rem]">
				<h1
					className="text-display-xl xl:text-display-2xl text-linen font-serif leading-[0.95] font-light tracking-[-0.03em]"
					aria-label={`${titleLine1} ${titleLine2}`}
				>
					<span ref={titleLine1Ref} className="block">
						{titleLine1}
					</span>
					<em
						ref={titleLine2Ref}
						className="text-champagne mt-1 block font-serif italic"
					>
						{titleLine2}
					</em>
				</h1>

				<div
					ref={descriptionRef}
					className="text-body-lg text-linen/68 mt-8 max-w-md font-sans leading-relaxed sm:mt-10"
				>
					{description}
				</div>

				<div
					ref={actionsRef}
					className="mt-10 flex w-full flex-col gap-3 sm:mt-12 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
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

			{/* Bottom scroll cue */}
			<div
				ref={scrollRef}
				className="flex items-end justify-between gap-6"
			>
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

/** Immersive 3D porcelain gallery hero — atelier editorial chrome over WebGL. */
export function LandingHeroImmersive({ isMobileSSR }: LandingHeroImmersiveProps) {
	const t = useTranslations("landing.hero");
	const prefersReducedMotion = usePrefersReducedMotion();
	const isDesktopHero = useMediaQuery(DESKTOP_LAYOUT_QUERY, !isMobileSSR);
	const hasFinePointer = useMediaQuery("(pointer: fine)", true);
	const useWebGL = isDesktopHero && !prefersReducedMotion;
	const enableCursorAmbience = isDesktopHero && !prefersReducedMotion && hasFinePointer;

	useGsapLenisSync(useWebGL);

	const sectionRef = useRef<HTMLElement>(null);
	const pinRef = useRef<HTMLDivElement>(null);
	const letterboxTopRef = useRef<HTMLDivElement>(null);
	const letterboxBottomRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLDivElement>(null);
	const canvasWrapRef = useRef<HTMLDivElement>(null);
	const cursorGlowRef = useRef<HTMLDivElement>(null);
	const railRef = useRef<HTMLDivElement>(null);
	const atelierRef = useRef<HTMLParagraphElement>(null);
	const titleLine1Ref = useRef<HTMLSpanElement>(null);
	const titleLine2Ref = useRef<HTMLElement>(null);
	const descriptionRef = useRef<HTMLDivElement>(null);
	const actionsRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const scrollProgressRef = useRef(0);
	const mouseRef = useRef({ x: 0, y: 0 });
	const isPointerOverRef = useRef(false);
	const introCompleteRef = useRef(false);
	const resetAmbienceRef = useRef<() => void>(() => undefined);
	const [isSceneActive, setIsSceneActive] = useState(true);
	const [isGsapReady, setIsGsapReady] = useState(false);
	const [shouldLoad3D, setShouldLoad3D] = useState(false);
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

	useEffect(() => {
		if (!useWebGL) {
			return;
		}
		return scheduleHeroWebGLMount(() => setShouldLoad3D(true));
	}, [useWebGL]);

	useEffect(() => {
		return scheduleGsapReady(() => setIsGsapReady(true));
	}, []);

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

	useEffect(() => {
		if (!useWebGL || !sectionRef.current) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsSceneActive(Boolean(entry?.isIntersecting));
			},
			{ threshold: 0, rootMargin: "0px" },
		);

		observer.observe(sectionRef.current);
		return () => observer.disconnect();
	}, [useWebGL]);

	useGSAP(
		() => {
			if (!isGsapReady) {
				return;
			}

			registerGsapPlugins();
			introCompleteRef.current = false;

			const section = sectionRef.current;
			const pin = pinRef.current;
			const letterboxTop = letterboxTopRef.current;
			const letterboxBottom = letterboxBottomRef.current;
			const content = contentRef.current;
			const backdrop = backdropRef.current;
			const canvasWrap = canvasWrapRef.current;
			const titleLine1 = titleLine1Ref.current;
			const titleLine2 = titleLine2Ref.current;
			const descriptionEl = descriptionRef.current;
			const actions = actionsRef.current;
			const rail = railRef.current;
			const atelier = atelierRef.current;
			const scrollCue = scrollRef.current;

			if (
				!section ||
				!pin ||
				!letterboxTop ||
				!letterboxBottom ||
				!content ||
				!titleLine1 ||
				!titleLine2 ||
				!descriptionEl ||
				!actions ||
				!rail ||
				!scrollCue
			) {
				return;
			}

			const splitLine1 = prefersReducedMotion
				? null
				: SplitText.create(titleLine1, { type: "chars" });
			const splitLine2 = prefersReducedMotion
				? null
				: SplitText.create(titleLine2, { type: "chars" });

			titleLine1.removeAttribute("aria-label");
			titleLine2.removeAttribute("aria-label");

			const riseTargets = prefersReducedMotion
				? [rail, atelier, titleLine1, titleLine2, descriptionEl, actions, scrollCue].filter(
						Boolean,
					)
				: [
						rail,
						atelier,
						...(splitLine1?.chars ?? []),
						...(splitLine2?.chars ?? []),
						descriptionEl,
						actions,
						scrollCue,
					].filter(Boolean);

			gsap.set(riseTargets, { opacity: 1, y: prefersReducedMotion ? 14 : 36 });
			if (canvasWrap) {
				gsap.set(canvasWrap, { opacity: 1, scale: prefersReducedMotion ? 1 : 1.04 });
			}

			gsap.set(letterboxTop, {
				scaleY: 1,
				opacity: 1,
				transformOrigin: "center top",
				force3D: true,
				autoAlpha: 1,
			});
			gsap.set(letterboxBottom, {
				scaleY: 1,
				opacity: 1,
				transformOrigin: "center bottom",
				force3D: true,
				autoAlpha: 1,
			});

			const hideLetterboxes = () => {
				gsap.set([letterboxTop, letterboxBottom], {
					autoAlpha: 0,
					pointerEvents: "none",
				});
			};

			const revealDuration = prefersReducedMotion ? 0.9 : 2.35;
			const copyRevealAt = revealDuration * 0.55;
			const introTimeline = gsap.timeline({ delay: 0.12 });

			introTimeline
				.add("reveal")
				.to(
					[letterboxTop, letterboxBottom],
					{
						scaleY: 0,
						opacity: 0,
						duration: revealDuration,
						ease: "power3.inOut",
					},
					"reveal",
				);

			if (canvasWrap && !prefersReducedMotion) {
				introTimeline.to(
					canvasWrap,
					{
						scale: 1,
						duration: revealDuration + 0.4,
						ease: "power2.out",
					},
					"reveal",
				);
			}

			introTimeline
				.call(hideLetterboxes, undefined, `reveal+=${revealDuration - 0.06}`)
				.to(
					rail,
					{ y: 0, duration: 0.85, ease: "power3.out" },
					`reveal+=${copyRevealAt}`,
				);

			if (atelier) {
				introTimeline.to(
					atelier,
					{ y: 0, duration: 0.85, ease: "power3.out" },
					"<0.05",
				);
			}

			introTimeline
				.to(
					splitLine1?.chars ?? titleLine1,
					{
						y: 0,
						duration: 0.8,
						stagger: prefersReducedMotion ? 0 : 0.026,
						ease: "power3.out",
					},
					"-=0.5",
				)
				.to(
					splitLine2?.chars ?? titleLine2,
					{
						y: 0,
						duration: 0.8,
						stagger: prefersReducedMotion ? 0 : 0.026,
						ease: "power3.out",
					},
					"-=0.58",
				)
				.to(
					descriptionEl,
					{ y: 0, duration: 0.75, ease: "power3.out" },
					"-=0.48",
				)
				.to(actions, { y: 0, duration: 0.75, ease: "power3.out" }, "-=0.55")
				.to(scrollCue, { y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5");

			introTimeline.eventCallback("onComplete", () => {
				introCompleteRef.current = true;
			});

			const setContentOpacity = gsap.quickSetter(content, "opacity");
			const setContentY = gsap.quickSetter(content, "y", "px");
			const setBackdropOpacity = backdrop
				? gsap.quickSetter(backdrop, "opacity")
				: null;

			const scrollTrigger = useWebGL
				? ScrollTrigger.create({
						trigger: section,
						start: "top top",
						end: `+=${LANDING_HERO_SCROLL_HEIGHT_VH}%`,
						pin: pin,
						scrub: 0.85,
						anticipatePin: 1,
						onUpdate: (self) => {
							scrollProgressRef.current = self.progress;

							if (self.progress > 0.08) {
								resetAmbienceRef.current();
							}

							setContentOpacity(1 - self.progress * 1.35);
							setContentY(-self.progress * 80);

							const fadeStart = 0.28;
							const backdropOpacity =
								self.progress <= fadeStart
									? 1
									: 1 - (self.progress - fadeStart) / (1 - fadeStart);

							setBackdropOpacity?.(Math.max(0, backdropOpacity));
						},
						onLeave: () => {
							gsap.set(pin, { autoAlpha: 0, pointerEvents: "none" });
							if (backdrop) {
								gsap.set(backdrop, { autoAlpha: 0 });
							}
							if (canvasWrap) {
								gsap.set(canvasWrap, { autoAlpha: 0 });
							}
							setIsSceneActive(false);
						},
						onEnterBack: () => {
							gsap.set(pin, { autoAlpha: 1, pointerEvents: "auto" });
							if (backdrop) {
								gsap.set(backdrop, { autoAlpha: 1, opacity: 1 });
							}
							if (canvasWrap) {
								gsap.set(canvasWrap, { autoAlpha: 1, opacity: 1 });
							}
							setIsSceneActive(true);
						},
					})
				: null;

			return () => {
				introTimeline.kill();
				scrollTrigger?.kill();
				splitLine1?.revert();
				splitLine2?.revert();
			};
		},
		{
			scope: sectionRef,
			dependencies: [prefersReducedMotion, useWebGL, isGsapReady],
		},
	);

	return (
		<section
			ref={sectionRef}
			className="bg-sapphire-deep relative isolate w-full overflow-hidden"
			style={{ height: useWebGL ? `${LANDING_HERO_SCROLL_HEIGHT_VH}vh` : "100dvh" }}
			aria-label={`${t("titleLine1")} ${t("titleLine2")}`}
		>
			<div
				ref={pinRef}
				className={cn(
					"relative h-[100dvh] w-full overflow-hidden lg:h-screen",
					useWebGL && "z-[1]",
				)}
				onPointerEnter={isDesktopHero ? onHeroPointerEnter : undefined}
				onPointerMove={isDesktopHero ? onHeroPointerMove : undefined}
				onPointerLeave={isDesktopHero ? onHeroPointerLeave : undefined}
			>
				<div ref={backdropRef} className="absolute inset-0 z-0">
					<div ref={canvasWrapRef} className="absolute inset-0 overflow-hidden will-change-transform">
						<Image
							src={MEDIA_PATHS.images.landing.heroGalleryPoster}
							alt={t("titleLine1")}
							fill
							priority
							sizes="100vw"
							className="object-cover object-center"
						/>
						{shouldLoad3D && (
							<PorcelainGalleryScene
								scrollProgressRef={scrollProgressRef}
								mouseRef={mouseRef}
								isPointerOverRef={isPointerOverRef}
								isActive={isSceneActive}
								className="absolute inset-0"
							/>
						)}
					</div>

					{/* Readable veil — keeps type legible without smothering the gallery */}
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
					<div
						ref={letterboxTopRef}
						className="bg-sapphire-deep absolute inset-x-0 top-0 h-1/2 origin-top will-change-transform"
					/>
					<div
						ref={letterboxBottomRef}
						className="bg-sapphire-deep absolute inset-x-0 bottom-0 h-1/2 origin-bottom will-change-transform"
					/>
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
						railRef={railRef}
						atelierRef={atelierRef}
						titleLine1Ref={titleLine1Ref}
						titleLine2Ref={titleLine2Ref}
						descriptionRef={descriptionRef}
						actionsRef={actionsRef}
						scrollRef={scrollRef}
					/>
				</div>
			</div>
		</section>
	);
}
