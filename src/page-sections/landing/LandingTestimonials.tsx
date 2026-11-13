"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Text, IconButton, PaginationDots, Eyebrow, DecorativeDivider } from "@/components/ui";
import { RevealOnView, SectionContainer } from "@/components/common";
import { TESTIMONIALS } from "@/constants/landing";
import { cn } from "@/lib/cn";

/** LandingTestimonials (animated carousel of client quotes). */
export function LandingTestimonials() {
	const t = useTranslations("landing.testimonials");
	const [activeIndex, setActiveIndex] = useState(0);

	const goToPrev = () =>
		setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
	const goToNext = () => setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);

	return (
		<section className="bg-sapphire-deep py-28 lg:py-36">
			<SectionContainer width="content" className="text-center">
				<RevealOnView>
					<Eyebrow>{t("label")}</Eyebrow>
				</RevealOnView>

				<RevealOnView delay={0.1} className="mt-8 flex justify-center">
					<Quote className="text-champagne/25 h-12 w-12" />
				</RevealOnView>

				<div className="relative mx-auto mt-12 h-[260px] w-full max-w-2xl [perspective:1200px]">
					{TESTIMONIALS.map((testimonial, i) => {
						const isActive = i === activeIndex;
						const itemNamespace = `items.${testimonial.id}`;

						let distance = i - activeIndex;
						if (distance < -1) distance += TESTIMONIALS.length;
						if (distance > 2) distance -= TESTIMONIALS.length;

						const isVisible = distance >= 0 && distance <= 2;
						const isPast = distance < 0;

						return (
							<motion.div
								key={testimonial.id}
								animate={{
									opacity: isActive ? 1 : isVisible ? 1 - distance * 0.4 : 0,
									y: isActive ? 0 : isPast ? -60 : distance * 25,
									z: isActive ? 0 : isPast ? 100 : distance * -100,
									rotateX: isActive ? 0 : isPast ? 5 : distance * -2,
									scale: isActive ? 1 : isPast ? 1.05 : 1 - distance * 0.05,
								}}
								transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
								className={cn(
									"border-sapphire-mist/40 bg-sapphire-ocean absolute inset-0 flex flex-col items-center justify-center rounded-2xl border p-8 shadow-2xl",
									!isActive && "pointer-events-none",
								)}
								style={{
									zIndex: 10 - Math.max(0, distance),
									transformStyle: "preserve-3d",
								}}
							>
								<Text
									as="blockquote"
									variant="h4"
									className="text-linen/90 font-serif font-light italic"
								>
									&ldquo;{t(`${itemNamespace}.quote`)}&rdquo;
								</Text>

								<div className="mt-8 flex flex-col items-center gap-1">
									<DecorativeDivider variant="inline" />
									<Text variant="body" className="text-linen mt-4 font-medium">
										{t(`${itemNamespace}.authorName`)}
									</Text>
									<Text variant="body-sm" className="text-linen/70">
										{t(`${itemNamespace}.authorTitle`)} —{" "}
										{t(`${itemNamespace}.authorCompany`)}
									</Text>
								</div>
							</motion.div>
						);
					})}
				</div>

				<div className="mt-10 flex items-center justify-center gap-6">
					<IconButton onClick={goToPrev} aria-label={t("aria.previous")}>
						<ChevronLeft className="h-5 w-5" />
					</IconButton>

					<PaginationDots
						count={TESTIMONIALS.length}
						activeIndex={activeIndex}
						onSelect={setActiveIndex}
						getAriaLabel={(index) => t("aria.goTo", { index: index + 1 })}
					/>

					<IconButton onClick={goToNext} aria-label={t("aria.next")}>
						<ChevronRight className="h-5 w-5" />
					</IconButton>
				</div>
			</SectionContainer>
		</section>
	);
}
