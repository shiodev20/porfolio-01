import { defineField, defineType } from "sanity";
import { pick } from "./locale";

const seoField = defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" });
const groups = [
  { name: "content", title: "Nội dung", default: true },
  { name: "seo", title: "SEO" },
];
const f = (name: string, title: string, type: string, extra: Record<string, unknown> = {}) =>
  defineField({ name, title, type, group: "content", ...extra } as never);

/* ---------- Singletons ---------- */

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Cài đặt chung",
  type: "document",
  groups: [
    { name: "brand", title: "Thương hiệu", default: true },
    { name: "contact", title: "Liên hệ" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({ name: "brandName", title: "Tên thương hiệu (logo)", type: "string", group: "brand" }),
    defineField({ name: "marqueeText", title: "Chữ chạy ở trang chủ", type: "string", group: "brand" }),
    defineField({ name: "email", title: "Email", type: "string", group: "contact", description: "Hiện ở trang Liên hệ và là địa chỉ nhận form." }),
    defineField({ name: "phone", title: "Số điện thoại", type: "string", group: "contact" }),
    defineField({ name: "socials", title: "Mạng xã hội", type: "array", of: [{ type: "socialLink" }], group: "contact", description: "Dùng chung cho menu, footer và trang Liên hệ." }),
    defineField({ name: "businessName", title: "Tên doanh nghiệp", type: "localeString", group: "contact" }),
    defineField({ name: "location", title: "Địa điểm", type: "localeString", group: "contact" }),
    defineField({ name: "footerEyebrow", title: "Dòng nhỏ phía trên", type: "localeText", group: "footer" }),
    defineField({ name: "footerTitle", title: "Tiêu đề lớn", type: "localeString", group: "footer" }),
    defineField({ name: "footerCta", title: "Chữ trên nút", type: "localeString", group: "footer" }),
    defineField({ name: "edition", title: "Dòng phiên bản", type: "localeString", group: "footer" }),
  ],
  preview: { prepare: () => ({ title: "Cài đặt chung" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Trang chủ",
  type: "document",
  groups,
  fields: [
    f("heroEyebrow", "Hero: dòng địa điểm", "localeString"),
    f("heroRole", "Hero: câu giới thiệu", "localeText"),
    f("heroImage", "Hero: ảnh chân dung", "imageWithAlt"),
    f("introLead", "Giới thiệu: đoạn chính", "localeText"),
    f("introSide", "Giới thiệu: đoạn phụ", "localeText"),
    f("introButton", "Giới thiệu: nút", "link"),
    f("exploreLabel", 'Nhãn phía trên các thẻ ("Explore")', "localeString"),
    f("cards", "Thẻ điều hướng", "array", { of: [{ type: "homeCard" }] }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "Trang chủ" }) },
});

export const portfolioPage = defineType({
  name: "portfolioPage",
  title: "Portfolio",
  type: "document",
  groups: [
    { name: "content", title: "Đầu trang", default: true },
    { name: "how", title: "How I work" },
    { name: "journey", title: "Hành trình" },
    { name: "education", title: "Học vấn" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    f("title", "Tiêu đề trang", "localeString"),
    f("lead", "Đoạn mở đầu", "localeText"),
    f("tagline", "Dòng tagline", "localeString"),
    f("image", "Ảnh", "imageWithAlt"),
    defineField({ name: "howLabel", title: "Nhãn mục", type: "localeString", group: "how" }),
    defineField({ name: "pillars", title: "Các trụ cột", type: "array", of: [{ type: "pillar" }], group: "how" }),
    defineField({ name: "flow", title: "Chuỗi (Clarity → Agency → Growth)", type: "array", of: [{ type: "localeString" }], group: "how" }),
    defineField({ name: "journeyLabel", title: "Nhãn mục", type: "localeString", group: "journey" }),
    defineField({ name: "journeyTitle", title: "Tiêu đề", type: "localeString", group: "journey" }),
    defineField({ name: "nowLabel", title: 'Mốc đầu: nhãn ("Now")', type: "localeString", group: "journey" }),
    defineField({ name: "nowMeaning", title: "Mốc đầu: tiêu đề", type: "localeString", group: "journey" }),
    defineField({ name: "nowTagline", title: "Mốc đầu: mô tả", type: "localeString", group: "journey" }),
    defineField({
      name: "stages",
      title: "Các giai đoạn (kéo để sắp xếp)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "careerStage" }] }],
      group: "journey",
      description: 'Nội dung từng giai đoạn sửa ở mục "Giai đoạn sự nghiệp" bên trái.',
    }),
    defineField({ name: "educationLabel", title: "Nhãn mục", type: "localeString", group: "education" }),
    defineField({ name: "educationNavLabel", title: "Tên mục trên thanh điều hướng", type: "localeString", group: "education" }),
    defineField({ name: "educationIntro", title: "Đoạn giới thiệu", type: "localeText", group: "education" }),
    defineField({
      name: "educationGroups",
      title: "Các nhóm (tab), kéo để sắp xếp",
      type: "array",
      of: [{ type: "reference", to: [{ type: "educationGroup" }] }],
      group: "education",
      description: 'Nội dung từng nhóm sửa ở mục "Nhóm học vấn" bên trái.',
    }),
    seoField,
  ],
  preview: { prepare: () => ({ title: "Portfolio" }) },
});

export const contactPage = defineType({
  name: "contactPage",
  title: "Liên hệ",
  type: "document",
  groups,
  fields: [
    f("eyebrow", "Dòng nhỏ phía trên", "localeString"),
    f("title", "Tiêu đề", "localeString"),
    f("nameLabel", "Form: câu hỏi tên", "localeString"),
    f("namePlaceholder", "Form: gợi ý tên", "localeString"),
    f("emailLabel", "Form: câu hỏi email", "localeString"),
    f("emailPlaceholder", "Form: gợi ý email", "localeString"),
    f("asQuestion", "Form: bạn liên hệ với tư cách", "choiceQuestion"),
    f("roleQuestion", "Form: hình thức hợp tác", "choiceQuestion"),
    f("formatQuestion", "Form: định dạng (chọn nhiều)", "choiceQuestion"),
    f("timingQuestion", "Form: thời gian", "choiceQuestion", {
      description: 'Giữ nguyên giá trị "today" để nút Hôm nay tự điền ngày.',
    }),
    f("messageLabel", "Form: câu hỏi nội dung", "localeString"),
    f("messagePlaceholder", "Form: gợi ý nội dung", "localeString"),
    f("submitLabel", "Form: nút gửi", "localeString"),
    seoField,
  ],
  preview: { prepare: () => ({ title: "Liên hệ" }) },
});

export const programPage = defineType({
  name: "programPage",
  title: "Trang chương trình",
  type: "document",
  groups,
  fields: [
    f("category", "Nhóm (dòng nhỏ phía trên)", "localeString"),
    f("title", "Tiêu đề", "localeString"),
    f("comingSoon", 'Hiện nhãn "Sắp ra mắt"', "boolean", { initialValue: true }),
    f("description", "Mô tả", "localeText"),
    seoField,
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: pick(title) }) },
});

/* ---------- Collections ---------- */

export const careerStage = defineType({
  name: "careerStage",
  title: "Giai đoạn sự nghiệp",
  type: "document",
  fields: [
    defineField({ name: "year", title: "Năm bắt đầu", type: "string", description: 'Vd. "2024" hoặc "2025+"' }),
    defineField({ name: "label", title: "Tên giai đoạn", type: "localeString" }),
    defineField({ name: "meaning", title: "Ý nghĩa (tiêu đề lớn)", type: "localeString" }),
    defineField({ name: "roles", title: "Các vị trí", type: "array", of: [{ type: "careerRole" }] }),
  ],
  preview: {
    select: { year: "year", label: "label", meaning: "meaning" },
    prepare: ({ year, label, meaning }) => ({ title: `${year ?? ""} · ${pick(label)}`, subtitle: pick(meaning) }),
  },
});

export const educationGroup = defineType({
  name: "educationGroup",
  title: "Nhóm học vấn",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Tên nhóm (tab)", type: "localeString" }),
    defineField({ name: "items", title: "Bằng cấp / chứng chỉ", type: "array", of: [{ type: "certificate" }] }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({ title: pick(title), subtitle: `${items?.length ?? 0} mục` }),
  },
});
