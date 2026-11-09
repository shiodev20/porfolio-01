import type { UIKey } from "../i18n";

/** Site pages: path (default language) + the UI key used for its name. */
export const pages = {
  home: { path: "/", label: "home" },
  portfolio: { path: "/portfolio", label: "portfolio" },
  contact: { path: "/contact", label: "contact" },
  course: { path: "/course", label: "course" },
  aiTool: { path: "/ai-tool", label: "aiTool" },
  // 404: the language switcher leads to the home page of each language
  notFound: { path: "/", label: "notFoundTitle" },
} as const satisfies Record<string, { path: string; label: UIKey }>;

export type PageKey = keyof typeof pages;

/** Page name for an internal link (shown on the page-transition cover). */
export const pageLabelFor = (href: string | undefined): UIKey | undefined =>
  Object.values(pages).find((p) => p.path === href)?.label;
