import { localeString, localeText } from "./locale";
import * as objects from "./objects";
import * as documents from "./documents";

export const schemaTypes = [localeString, localeText, ...Object.values(objects), ...Object.values(documents)];

/** One document each, opened directly from the sidebar (no create / delete). */
export const singletons = [
  { id: "siteSettings", type: "siteSettings", title: "Cài đặt chung" },
  { id: "homePage", type: "homePage", title: "Trang chủ" },
  { id: "portfolioPage", type: "portfolioPage", title: "Portfolio" },
  { id: "contactPage", type: "contactPage", title: "Liên hệ" },
  { id: "coursePage", type: "programPage", title: "Course" },
  { id: "aiToolPage", type: "programPage", title: "AI Tool" },
];
