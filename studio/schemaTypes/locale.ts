import { defineType } from "sanity";
import { languages, defaultLanguage } from "../../shared/languages";

/**
 * Field-level translation: every translatable field stores { en: "...", vi: "..." }.
 * The sub-fields are generated from shared/languages.ts, so adding a language there
 * adds a box here automatically. Empty translations fall back to the default language.
 */
const fieldsFor = (type: "string" | "text") =>
  languages.map((lang) => ({
    name: lang.id,
    title: lang.title,
    type,
    ...(type === "text" ? { rows: 3 } : {}),
    ...(lang.id === defaultLanguage
      ? {}
      : { description: `Để trống sẽ hiển thị bản ${languages.find((l) => l.id === defaultLanguage)!.title}` }),
  }));

export const localeString = defineType({
  name: "localeString",
  title: "Chữ (đa ngôn ngữ)",
  type: "object",
  fields: fieldsFor("string"),
  options: { columns: 1 },
});

export const localeText = defineType({
  name: "localeText",
  title: "Đoạn văn (đa ngôn ngữ)",
  type: "object",
  description: "Xuống dòng bằng Enter.",
  fields: fieldsFor("text"),
});

/** Preview helper: pick the default-language value of a locale field. */
export const pick = (v?: Record<string, string>) =>
  v?.[defaultLanguage] || Object.values(v || {}).find((x) => typeof x === "string" && x) || "";
