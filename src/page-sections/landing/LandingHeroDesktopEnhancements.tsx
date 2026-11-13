"use client";

import { useEffect, type RefObject } from "react";
import { PorcelainGalleryScene } from "@/components/3d/PorcelainGalleryScene";
import { useGsapLenisSync } from "@/hooks/useGsapLenisSync";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap";

export interface LandingHeroDesktopEnhancementsProps {
	sectionRef: RefObject<HTMLElement | null>;
	pinRef: RefObject<HTMLDivElement | null>;
	contentRef: RefObject<HTMLDivElement | null>;
	backdropRef: RefObject<HTMLDivElement | null>;
	canvasWrapRef: RefObject<HTMLDivElement | null>;
	scrollProgressRef: RefObject<number>;
	mouseRef: RefObject<{ x: number; y: number }>;
	isPointerOverRef: RefObject<boolean>;
	introCompleteRef: RefObject<boolean>;
	resetAmbienceRef: RefObject<() => void>;
	isSceneActive: boolean;
	onSceneActiveChange: (isActive: boolean) => void;
	onGalleryReady: () => void;
}

/**
 * Desktop WebGL gallery + scroll scrub — mounts with the hero.
 * Signals `onGalleryReady` after the first painted frame so the letterbox opens onto 3D only.
 */
export function LandingHeroDesktopEnhancements({
	sectionRef,
	pinRef,
	contentRef,
	backdropRef,
	canvasWrapRef,
	scrollProgressRef,
	mouseRef,
	isPointerOverRef,
	introCompleteRef,
	resetAmbienceRef,
	isSceneActive,
	onSceneActiveChange,
	onGalleryReady,
}: LandingHeroDesktopEnhancementsProps) {
	useGsapLenisSync(true);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				onSceneActiveChange(Boolean(entry?.isIntersecting));
			},
			{ threshold: 0, rootMargin: "0px" },
		);

		observer.observe(section);
		return () => observer.disconnect();
	}, [sectionRef, onSceneActiveChange]);

	useEffect(() => {
		registerGsapPlugins();

		const section = sectionRef.current;
		const pin = pinRef.current;
		const content = contentRef.current;
		const backdrop = backdropRef.current;
		const canvasWrap = canvasWrapRef.current;

		if (!section || !pin || !content) {
			return;
		}

		const setContentOpacity = gsap.quickSetter(content, "opacity");
		const setContentY = gsap.quickSetter(content, "y", "px");
		const setBackdropOpacity = backdrop
			? gsap.quickSetter(backdrop, "opacity")
			: null;

		const scrollTrigger = ScrollTrigger.create({
			trigger: section,
			start: "top top",
			end: "bottom bottom",
			scrub: 0.85,
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
				onSceneActiveChange(false);
			},
			onEnterBack: () => {
				gsap.set(pin, { autoAlpha: 1, pointerEvents: "auto" });
				if (backdrop) {
					gsap.set(backdrop, { autoAlpha: 1, opacity: 1 });
				}
				if (canvasWrap) {
					gsap.set(canvasWrap, { autoAlpha: 1, opacity: 1 });
				}
				onSceneActiveChange(true);
			},
		});

		introCompleteRef.current = true;
		ScrollTrigger.refresh();

		return () => {
			scrollTrigger.kill();
		};
	}, [
		sectionRef,
		pinRef,
		contentRef,
		backdropRef,
		canvasWrapRef,
		scrollProgressRef,
		resetAmbienceRef,
		introCompleteRef,
		onSceneActiveChange,
	]);

	return (
		<PorcelainGalleryScene
			scrollProgressRef={scrollProgressRef}
			mouseRef={mouseRef}
			isPointerOverRef={isPointerOverRef}
			isActive={isSceneActive}
			onFirstFrame={onGalleryReady}
			className="absolute inset-0"
		/>
	);
}
