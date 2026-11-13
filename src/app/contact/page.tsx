import { permanentRedirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function ContactRedirectPage() {
	permanentRedirect(`/${routing.defaultLocale}/contact`);
}
