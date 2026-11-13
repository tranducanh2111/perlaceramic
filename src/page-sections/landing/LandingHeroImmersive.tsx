"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import { Badge, Button } from "@/components/ui";
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

/** Milliseconds after mount before the GSAP intro timeline is initialised.
 *  Allows the browser to paint SSR content cleanly before attaching animations. */
const GSAP_INIT_DEFER_MS = 60;

const PorcelainGalleryScene = dynamic(
	() =>
		import("@/components/3d/PorcelainGalleryScene").then((module) => ({
			default: module.PorcelainGalleryScene,
		})),
	{ ssr: false },
);

interface LandingHeroImmersiveProps {
	isMobileSSR?: boolean;
}

interface HeroCopyProps {
	label: string;
	titleLine1: string;
	titleLine2: string;
	description: ReactNode;
	primaryCta: string;
	secondaryCta: string;
	titleLine1Ref?: React.RefObject<HTMLSpanElement | null>;
	titleLine2Ref?: React.RefObject<HTMLElement | null>;
	descriptionRef?: React.RefObject<HTMLDivElement | null>;
	actionsRef?: React.RefObject<HTMLDivElement | null>;
	labelRef?: React.RefObject<HTMLDivElement | null>;
}

function HeroCopy({
	label,
	titleLine1,
	titleLine2,
	description,
	primaryCta,
	secondaryCta,
	titleLine1Ref,
	titleLine2Ref,
	descriptionRef,
	actionsRef,
	labelRef,
}: HeroCopyProps) {
	return (
		<>
			<div ref={labelRef}>
				<Badge variant="hero">{label}</Badge>
			</div>

			<h1
				className="text-display-xl lg:text-display-2xl text-linen mt-6 max-w-3xl font-serif leading-[1.1] font-light"
				aria-label={`${titleLine1} ${titleLine2}`}
			>
				<span ref={titleLine1Ref}>{titleLine1}</span>
				<br />
				<em ref={titleLine2Ref} className="text-champagne italic">
					{titleLine2}
				</em>
			</h1>

			<div
				ref={descriptionRef}
				className="text-body-lg text-linen/60 mt-6 max-w-lg font-sans"
			>
				{description}
			</div>

			<div
				ref={actionsRef}
				className="mt-10 flex flex-col gap-4 sm:flex-row"
			>
				<Button href={ROUTES.projects} size="lg">
					{primaryCta}
				</Button>
				<Button href={ROUTES.products} variant="secondary" size="lg">
					{secondaryCta}
				</Button>
			</div>
		</>
	);
}

/** Immersive 3D porcelain gallery hero with GSAP intro and scroll-pinned outro. */
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
	const scrimRef = useRef<HTMLDivElement>(null);
	const backdropRef = useRef<HTMLDivElement>(null);
	const canvasWrapRef = useRef<HTMLDivElement>(null);
	const cursorGlowRef = useRef<HTMLDivElement>(null);
	const labelRef = useRef<HTMLDivElement>(null);
	const titleLine1Ref = useRef<HTMLSpanElement>(null);
	const titleLine2Ref = useRef<HTMLElement>(null);
	const descriptionRef = useRef<HTMLDivElement>(null);
	const actionsRef = useRef<HTMLDivElement>(null);

	const scrollProgressRef = useRef(0);
	const mouseRef = useRef({ x: 0, y: 0 });
	const isPointerOverRef = useRef(false);
	const introCompleteRef = useRef(false);
	const resetAmbienceRef = useRef<() => void>(() => undefined);
	const [isSceneActive, setIsSceneActive] = useState(true);
	const isClient = useIsClient();
	const isCursorAmbienceReady = isClient && enableCursorAmbience;

	/** Defer GSAP init until after the LCP window to reduce desktop TBT. */
	const [isGsapReady, setIsGsapReady] = useState(false);
	/** Defer 3D WebGL scene until user interacts (move/scroll) or initial load settles. */
	const [shouldLoad3D, setShouldLoad3D] = useState(false);

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

	/** Defer 3D canvas until first user interaction or when the page is completely idle. */
	useEffect(() => {
		if (!useWebGL) return;

		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const handleInteraction = () => {
			setShouldLoad3D(true);
			cleanup();
		};

		const cleanup = () => {
			window.removeEventListener("pointermove", handleInteraction);
			window.removeEventListener("scroll", handleInteraction);
			window.removeEventListener("touchstart", handleInteraction);
			if (timeoutId) clearTimeout(timeoutId);
		};

		window.addEventListener("pointermove", handleInteraction, { passive: true, once: true });
		window.addEventListener("scroll", handleInteraction, { passive: true, once: true });
		window.addEventListener("touchstart", handleInteraction, { passive: true, once: true });

		timeoutId = setTimeout(() => {
			setShouldLoad3D(true);
			cleanup();
		}, 3000);

		return cleanup;
	}, [useWebGL]);

	/** Gate GSAP behind a short defer so it doesn't block the LCP window. */
	useEffect(() => {
		const id = setTimeout(() => setIsGsapReady(true), GSAP_INIT_DEFER_MS);
		return () => clearTimeout(id);
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
			// Wait for the deferred GSAP ready flag before touching the DOM.
			if (!isGsapReady) return;

			registerGsapPlugins();
			introCompleteRef.current = false;

			const section = sectionRef.current;
			const pin = pinRef.current;
			const letterboxTop = letterboxTopRef.current;
			const letterboxBottom = letterboxBottomRef.current;
			const content = contentRef.current;
			const scrim = scrimRef.current;
			const backdrop = backdropRef.current;
			const canvasWrap = canvasWrapRef.current;
			const heroMedia = canvasWrap;
			const titleLine1 = titleLine1Ref.current;
			const titleLine2 = titleLine2Ref.current;
			const descriptionEl = descriptionRef.current;
			const actions = actionsRef.current;
			const label = labelRef.current;

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
				!label
			) {
				return;
			}

			const splitLine1 = prefersReducedMotion
				? null
				: SplitText.create(titleLine1, { type: "chars" });
			const splitLine2 = prefersReducedMotion
				? null
				: SplitText.create(titleLine2, { type: "chars" });

			// Strip prohibited aria-label attributes set by SplitText on generic span/em tags
			// to ensure a well-formed accessibility tree (fixes agent-accessibility-tree & aria-prohibited-attr)
			titleLine1.removeAttribute("aria-label");
			titleLine2.removeAttribute("aria-label");

			const introTargets = prefersReducedMotion
				? [label, titleLine1, titleLine2, descriptionEl, actions]
				: [
						label,
						...(splitLine1?.chars ?? []),
						...(splitLine2?.chars ?? []),
						descriptionEl,
						actions,
					];

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

			const revealDuration = 0.9;

			const introTimeline = gsap.timeline({ delay: 0.05 });

			if (prefersReducedMotion) {
				introTimeline
					.to([letterboxTop, letterboxBottom], {
						opacity: 0,
						duration: 0.5,
						ease: "power2.inOut",
					})
					.call(hideLetterboxes);
			} else {
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
					)
					.call(hideLetterboxes, undefined, `reveal+=${revealDuration - 0.05}`);
			}

			introTimeline.eventCallback("onComplete", () => {
				introCompleteRef.current = true;
			});

			const scrollTrigger = useWebGL
				? ScrollTrigger.create({
						trigger: section,
						start: "top top",
						end: `+=${LANDING_HERO_SCROLL_HEIGHT_VH}%`,
						pin: pin,
						scrub: 0.85,
						onUpdate: (self) => {
							scrollProgressRef.current = self.progress;

							if (self.progress > 0.08) {
								resetAmbienceRef.current();
							}

							gsap.set(content, {
								opacity: 1 - self.progress * 1.35,
								y: -self.progress * 72,
							});

							const fadeStart = 0.28;
							const backdropOpacity =
								self.progress <= fadeStart
									? 1
									: 1 - (self.progress - fadeStart) / (1 - fadeStart);

							if (backdrop) {
								gsap.set(backdrop, { opacity: Math.max(0, backdropOpacity) });
							}

							if (scrim) {
								gsap.set(scrim, {
									opacity: 0.42 * backdropOpacity,
								});
							}
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
			aria-label={t("titleLine1")}
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
					{!useWebGL && (
						<div
							className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,var(--color-sapphire-mist)_0%,var(--color-sapphire-deep)_70%)]"
							aria-hidden="true"
						/>
					)}

					<div ref={canvasWrapRef} className="absolute inset-0">
						<Image
							src={MEDIA_PATHS.images.landing.heroGalleryPoster}
							alt={t("titleLine1")}
							fill
							priority
							sizes="100vw"
							className="object-cover object-center"
						/>
						{useWebGL && shouldLoad3D && (
							<PorcelainGalleryScene
								scrollProgressRef={scrollProgressRef}
								mouseRef={mouseRef}
								isPointerOverRef={isPointerOverRef}
								isActive={isSceneActive}
								className="absolute inset-0"
							/>
						)}
					</div>

					{!useWebGL && (
						<div
							ref={scrimRef}
							className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sapphire-deep/88 via-sapphire-deep/25 to-sapphire-deep/40"
							aria-hidden="true"
						/>
					)}
				</div>

				{isCursorAmbienceReady && (
					<div
						ref={cursorGlowRef}
						className="pointer-events-none absolute top-0 left-0 z-[2] h-[min(38vw,480px)] w-[min(38vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,184,134,0.14)_0%,rgba(212,184,134,0.04)_42%,transparent_72%)] opacity-0 will-change-transform"
						aria-hidden="true"
					/>
				)}

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

				<div
					ref={contentRef}
					className="relative z-20 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-20 text-center sm:px-8 sm:py-16 lg:h-full lg:min-h-0 lg:py-0"
				>
					<HeroCopy
						label={t("label")}
						titleLine1={t("titleLine1")}
						titleLine2={t("titleLine2")}
						description={description}
						primaryCta={t("primaryCta")}
						secondaryCta={t("secondaryCta")}
						labelRef={labelRef}
						titleLine1Ref={titleLine1Ref}
						titleLine2Ref={titleLine2Ref}
						descriptionRef={descriptionRef}
						actionsRef={actionsRef}
					/>
				</div>
			</div>
		</section>
	);
}
