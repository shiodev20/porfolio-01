/**
 * i18n helpers.
 * - Languages come from shared/languages.ts (shared with the Sanity Studio).
 * - Interface strings (menu, buttons, aria labels) live in ./ui/<lang>.ts and are
 *   picked up automatically; a missing file or key falls back to the default language.
 * - Content strings come from Sanity as { en: "...", vi: "..." } and go through tr().
 */
import { languages, defaultLanguage, type LanguageId } from "../../../shared/languages";
import en from "./ui/en";

export { languages, defaultLanguage, type LanguageId };
export type UIKey = keyof typeof en;
type Dict = Partial<Record<UIKey, string>>;

const dicts: Record<string, Dict> = Object.fromEntries(
  Object.entries(import.meta.glob<{ default: Dict }>("./ui/*.ts", { eager: true })).map(([file, mod]) => [
    file.match(/([\w-]+)\.ts$/)![1],
    mod.default,
  ]),
);

/** Interface string for a language: t("menu") */
export const useT = (lang: LanguageId) => (key: UIKey) => dicts[lang]?.[key] ?? dicts[defaultLanguage]?.[key] ?? en[key];

/** Localized content value, falling back to the default language. */
export type Localized = Partial<Record<string, string>> | undefined | null;
export const tr = (value: Localized, lang: LanguageId): string =>
  (value?.[lang] || value?.[defaultLanguage] || "").toString();

/** Escape + keep line breaks: for set:html on multi-line text fields. */
export const html = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br>");

/** "/portfolio" -> "/vi/portfolio" for non-default languages. External links and anchors are left alone. */
export function localizePath(href: string | undefined, lang: LanguageId): string {
  if (!href) return "#";
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (lang === defaultLanguage) return href;
  return href === "/" ? `/${lang}` : `/${lang}${href}`;
}

/** The same page in every language: { en: "/portfolio", vi: "/vi/portfolio" } */
export const alternates = (path: string) =>
  Object.fromEntries(languages.map((l) => [l.id, localizePath(path, l.id)])) as Record<LanguageId, string>;

/** getStaticPaths for every page: one build per language, default language without prefix. */
export const langPaths = () =>
  languages.map((l) => ({ params: { lang: l.id === defaultLanguage ? undefined : l.id }, props: { lang: l.id as LanguageId } }));
