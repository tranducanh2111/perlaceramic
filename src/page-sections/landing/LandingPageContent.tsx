"use client";

import dynamic from "next/dynamic";
import { useLenisResizeOnMount } from "@/hooks/useLenisResizeOnMount";
import { LandingHeroImmersive } from "@/page-sections/landing/LandingHeroImmersive";
import { LandingBrandStatement } from "@/page-sections/landing/LandingBrandStatement";

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

/**
 * Client shell (hero + brand statement + stats + testimonials + cta are SSR'd).
 * Complex browser-API sections (Projects, Materials, Process, VisualStory) code-split
 */
export function LandingPageContent({ isMobileSSR }: { isMobileSSR?: boolean }) {
	useLenisResizeOnMount();

	return (
		<>
			<LandingHeroImmersive isMobileSSR={isMobileSSR} />
			<LandingBrandStatement />
			<LandingProjects />
			<LandingMaterials />
			<LandingStats />
			<LandingProcess />
			<LandingTestimonials />
			<LandingVisualStory />
			<LandingCta />
		</>
	);
}
