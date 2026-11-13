import { permanentRedirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function AboutRedirectPage() {
	permanentRedirect(`/${routing.defaultLocale}/about`);
}
