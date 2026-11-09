/**
 * Languages: the single source of truth for both the website (web/) and the dashboard (studio/).
 *
 * Adding a language (e.g. French):
 *   1. Add { id: "fr", title: "Français", short: "FR", locale: "fr_FR" } below.
 *   2. Optional: add web/src/i18n/ui/fr.ts for the interface strings (menu, buttons…).
 *      Any string missing there falls back to the default language.
 *   3. Restart `npm run dev` in web/ and studio/.
 * The dashboard then shows a "Français" box under every text field, and the site
 * builds /fr/... pages with the language switcher listing it. Empty fields fall back
 * to the default language, so content can be translated gradually.
 */
export const languages = [
  { id: "en", title: "English", short: "EN", locale: "en_US" },
  { id: "vi", title: "Tiếng Việt", short: "VN", locale: "vi_VN" },
] as const;

export type LanguageId = (typeof languages)[number]["id"];

/** Served without a URL prefix ("/portfolio"); the others get one ("/vi/portfolio"). */
export const defaultLanguage: LanguageId = "en";
