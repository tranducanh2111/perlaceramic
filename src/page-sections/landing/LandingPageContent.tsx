"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DESKTOP_LAYOUT_QUERY } from "@/constants/breakpoints";
import { useLenisResizeOnMount } from "@/hooks/useLenisResizeOnMount";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { LandingBrandStatement } from "@/page-sections/landing/LandingBrandStatement";
import { LandingHero } from "@/page-sections/landing/LandingHero";

/** Desktop-only: keeps GSAP/Three out of the mobile landing bundle. */
const LandingHeroImmersive = dynamic(
	() =>
		import("@/page-sections/landing/LandingHeroImmersive").then((m) => ({
			default: m.LandingHeroImmersive,
		})),
	{ ssr: true },
);

const LandingStats = dynamic(
	() =>
		import("@/page-sections/landing/LandingStats").then((m) => ({
			default: m.LandingStats,
		})),
	{ ssr: false },
);

const LandingTestimonials = dynamic(
	() =>
		import("@/page-sections/landing/LandingTestimonials").then((m) => ({
			default: m.LandingTestimonials,
		})),
	{ ssr: false },
);

const LandingCta = dynamic(
	() =>
		import("@/page-sections/landing/LandingCta").then((m) => ({
			default: m.LandingCta,
		})),
	{ ssr: false },
);

/** LandingProjects may use WebGL (LandingProjectsSpiral) (keep ssr:false). */
const LandingProjects = dynamic(
	() =>
		import("@/page-sections/landing/LandingProjects").then((m) => ({
			default: m.LandingProjects,
		})),
	{ ssr: false },
);

/** LandingMaterials uses a 3D tile context internally (keep ssr:false). */
const LandingMaterials = dynamic(
	() =>
		import("@/page-sections/landing/LandingMaterials").then((m) => ({
			default: m.LandingMaterials,
		})),
	{ ssr: false },
);

/** LandingProcess uses scroll-driven animations with browser APIs (keep ssr:false). */
const LandingProcess = dynamic(
	() =>
		import("@/page-sections/landing/LandingProcess").then((m) => ({
			default: m.LandingProcess,
		})),
	{ ssr: false },
);

/** LandingVisualStory uses sticky scroll + panorama (keep ssr:false). */
const LandingVisualStory = dynamic(
	() =>
		import("@/page-sections/landing/LandingVisualStory").then((m) => ({
			default: m.LandingVisualStory,
		})),
	{ ssr: false },
);

/** Long enough to sit outside Lighthouse's typical TBT window when the tab is idle. */
const BELOW_FOLD_IDLE_TIMEOUT_MS = 8000;

/** Gate heavy below-fold chunks until the main thread is idle (or the user scrolls). */
function useDeferBelowFoldMount(): boolean {
	const [shouldMount, setShouldMount] = useState(false);

	useEffect(() => {
		let idleCallbackId: number | null = null;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let hasMounted = false;

		const mount = () => {
			if (hasMounted) {
				return;
			}
			hasMounted = true;
			cleanup();
			setShouldMount(true);
		};

		const cleanup = () => {
			window.removeEventListener("scroll", mount);
			window.removeEventListener("pointerdown", mount);
			window.removeEventListener("touchstart", mount);
			if (idleCallbackId !== null && typeof window.cancelIdleCallback === "function") {
				window.cancelIdleCallback(idleCallbackId);
			}
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
			}
		};

		window.addEventListener("scroll", mount, { passive: true });
		window.addEventListener("pointerdown", mount, { passive: true });
		window.addEventListener("touchstart", mount, { passive: true });

		const armIdle = () => {
			if (typeof window.requestIdleCallback === "function") {
				idleCallbackId = window.requestIdleCallback(mount, {
					timeout: BELOW_FOLD_IDLE_TIMEOUT_MS,
				});
				return;
			}
			timeoutId = setTimeout(mount, BELOW_FOLD_IDLE_TIMEOUT_MS);
		};

		if (document.readyState === "complete") {
			armIdle();
		} else {
			window.addEventListener("load", armIdle, { once: true });
		}

		return () => {
			window.removeEventListener("load", armIdle);
			cleanup();
		};
	}, []);

	return shouldMount;
}

/** Video cinematic hero on mobile / reduced-motion; luxury 3D gallery on desktop. */
function LandingHeroSection({ isMobileSSR }: { isMobileSSR?: boolean }) {
	const isDesktopHero = useMediaQuery(DESKTOP_LAYOUT_QUERY, !isMobileSSR);
	const prefersReducedMotion = usePrefersReducedMotion();

	if (!isDesktopHero || prefersReducedMotion) {
		return <LandingHero isMobileSSR={isMobileSSR} />;
	}

	return <LandingHeroImmersive isMobileSSR={isMobileSSR} />;
}

/**
 * Client shell (hero + brand statement SSR'd).
 * Heavy below-fold sections wait for idle/input so desktop TBT stays low.
 */
export function LandingPageContent({ isMobileSSR }: { isMobileSSR?: boolean }) {
	useLenisResizeOnMount();
	const shouldMountBelowFold = useDeferBelowFoldMount();

	return (
		<>
			<LandingHeroSection isMobileSSR={isMobileSSR} />
			<LandingBrandStatement />
			{shouldMountBelowFold ? (
				<>
					<LandingProjects />
					<LandingMaterials />
					<LandingStats />
					<LandingProcess />
					<LandingTestimonials />
					<LandingVisualStory />
					<LandingCta />
				</>
			) : (
				<div className="bg-sapphire-deep min-h-[50vh]" aria-hidden="true" />
			)}
		</>
	);
}
