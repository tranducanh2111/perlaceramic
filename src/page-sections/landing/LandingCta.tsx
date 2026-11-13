"use client";

import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Text, DecorativeDivider } from "@/components/ui";
import { ClosingCtaSection } from "@/components/common";
import { GOOGLE_MAPS_URL } from "@/constants/contact";
import { ROUTES } from "@/constants/routes";

/** LandingCta */
export function LandingCta() {
	const t = useTranslations("landing.cta");
	const commonT = useTranslations("common");

	return (
		<section className="bg-sapphire-ocean relative overflow-hidden py-28 lg:py-36">
			<div
				className="cta-glow-pulse bg-champagne/5 absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
				aria-hidden="true"
			/>

			<DecorativeDivider variant="gradient" className="absolute top-0 right-0 left-0" />

			<ClosingCtaSection
				bare
				titleLine1={t("titleLine1")}
				titleLine2={t("titleLine2")}
				description={t("description")}
				actions={[
					{
						label: t("primaryCta"),
						href: ROUTES.contact,
						variant: "primary",
						withShimmer: true,
					},
					{ label: t("secondaryCta"), href: ROUTES.products, variant: "secondary" },
				]}
				actionsDelay={0.3}
				footer={
					<div className="border-sapphire-mist mt-14 flex flex-col items-center gap-4 border-t pt-10 sm:flex-row sm:justify-center">
						<a
							href={GOOGLE_MAPS_URL}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`${t("officeAddress")}, ${commonT("opensInNewWindow")}`}
							className="text-linen/70 hover:text-champagne inline-flex items-center gap-2 transition-colors duration-300"
						>
							<MapPin className="text-champagne h-4 w-4 shrink-0" />
							<Text variant="body-sm">{t("officeAddress")}</Text>
						</a>
					</div>
				}
			/>
		</section>
	);
}
