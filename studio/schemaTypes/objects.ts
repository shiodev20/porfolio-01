import { defineField, defineType } from "sanity";
import { pick } from "./locale";

const hrefField = defineField({
  name: "href",
  title: "Link",
  type: "string",
  description: 'Trang trong web: "/portfolio", "/contact", "/course"… (tự thêm /vi khi ở bản tiếng Việt). Link ngoài: "https://…".',
});

export const link = defineType({
  name: "link",
  title: "Nút / link",
  type: "object",
  fields: [defineField({ name: "label", title: "Chữ trên nút", type: "localeString" }), hrefField],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "title", title: "Tiêu đề tab / Google", type: "localeString" }),
    defineField({ name: "description", title: "Mô tả Google", type: "localeText" }),
    defineField({ name: "image", title: "Ảnh chia sẻ (Facebook, Zalo…)", type: "image", description: "Khuyến nghị 1200×630." }),
  ],
});

export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Ảnh",
  type: "image",
  options: { hotspot: true },
  fields: [defineField({ name: "alt", title: "Mô tả ảnh (cho người khiếm thị & SEO)", type: "localeString" })],
});

export const socialLink = defineType({
  name: "socialLink",
  title: "Mạng xã hội",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Tên", type: "string", validation: (r) => r.required() }),
    defineField({ name: "url", title: "Link", type: "url" }),
  ],
  preview: { select: { title: "label", subtitle: "url" } },
});

export const homeCard = defineType({
  name: "homeCard",
  title: "Thẻ",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "localeString" }),
    defineField({ name: "category", title: "Nhóm (dòng nhỏ phía trên)", type: "localeString" }),
    defineField({ name: "description", title: "Mô tả", type: "localeString" }),
    hrefField,
    defineField({ name: "comingSoon", title: 'Hiện nhãn "Sắp ra mắt"', type: "boolean", initialValue: false }),
    defineField({ name: "image", title: "Ảnh", type: "image", options: { hotspot: true } }),
    defineField({
      name: "tint",
      title: "Màu nền khi ảnh đang tải",
      type: "string",
      options: {
        list: [
          { title: "Khaki nhạt", value: "khaki-35" },
          { title: "Khaki", value: "khaki-55" },
          { title: "Blush", value: "blush-55" },
        ],
        layout: "radio",
      },
      initialValue: "khaki-35",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "image" },
    prepare: ({ title, subtitle, media }) => ({ title: pick(title), subtitle: pick(subtitle), media }),
  },
});

export const pillar = defineType({
  name: "pillar",
  title: "Trụ cột",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "localeString" }),
    defineField({ name: "text", title: "Mô tả", type: "localeText" }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: pick(title) }) },
});

export const achievement = defineType({
  name: "achievement",
  title: "Thẻ thành tựu",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Tiêu đề", type: "localeString" }),
    defineField({ name: "text", title: "Nội dung", type: "localeText" }),
  ],
  preview: { select: { title: "title" }, prepare: ({ title }) => ({ title: pick(title) }) },
});

export const careerRole = defineType({
  name: "careerRole",
  title: "Vị trí công việc",
  type: "object",
  groups: [
    { name: "row", title: "Dòng tóm tắt", default: true },
    { name: "detail", title: "Chi tiết" },
  ],
  fields: [
    defineField({ name: "organization", title: "Tổ chức", type: "string", group: "row", validation: (r) => r.required() }),
    defineField({ name: "category", title: "Lĩnh vực", type: "localeString", group: "row" }),
    defineField({ name: "role", title: "Chức danh", type: "localeString", group: "row" }),
    defineField({ name: "period", title: "Thời gian", type: "localeString", group: "row" }),
    defineField({
      name: "anchor",
      title: "Mã link (#…)",
      type: "string",
      group: "row",
      description: 'Dùng để link thẳng tới dòng này, vd. "/portfolio#studify". Chỉ chữ thường, số, gạch ngang.',
      validation: (r) => r.regex(/^[a-z0-9-]+$/),
    }),
    defineField({ name: "context", title: "Context", type: "localeText", group: "detail" }),
    defineField({ name: "gallery", title: "Ảnh", type: "array", of: [{ type: "image", options: { hotspot: true } }], options: { layout: "grid" }, group: "detail" }),
    defineField({ name: "keyContribution", title: "Key Contribution", type: "localeText", group: "detail" }),
    defineField({ name: "achievementText", title: "Achievement (đoạn văn)", type: "localeText", group: "detail" }),
    defineField({ name: "achievements", title: "Achievement (dạng thẻ)", type: "array", of: [{ type: "achievement" }], group: "detail", description: "Dùng thay cho, hoặc kèm theo, đoạn văn ở trên." }),
    defineField({ name: "cta", title: "Nút (tuỳ chọn)", type: "link", group: "detail" }),
    defineField({ name: "pendingNote", title: 'Ghi chú "sắp có" (tuỳ chọn)', type: "localeString", group: "detail" }),
    defineField({ name: "builtTags", title: "What It Built in Me: tags", type: "array", of: [{ type: "localeString" }], group: "detail" }),
    defineField({ name: "builtText", title: "What It Built in Me: đoạn văn", type: "localeText", group: "detail" }),
  ],
  preview: {
    select: { title: "organization", subtitle: "role", period: "period" },
    prepare: ({ title, subtitle, period }) => ({ title, subtitle: [pick(subtitle), pick(period)].filter(Boolean).join(" · ") }),
  },
});

export const certificate = defineType({
  name: "certificate",
  title: "Bằng cấp / chứng chỉ",
  type: "object",
  fields: [
    defineField({ name: "degree", title: "Tên bằng / chứng chỉ", type: "localeString" }),
    defineField({ name: "organization", title: "Tổ chức cấp", type: "localeString" }),
    defineField({ name: "year", title: "Năm", type: "localeString" }),
    defineField({ name: "inProgress", title: 'Nhãn "Đang theo học"', type: "boolean", initialValue: false }),
    defineField({ name: "certificate", title: "Ảnh chứng chỉ", type: "image" }),
  ],
  preview: {
    select: { title: "degree", subtitle: "organization", year: "year", media: "certificate" },
    prepare: ({ title, subtitle, year, media }) => ({ title: pick(title), subtitle: [pick(subtitle), pick(year)].filter(Boolean).join(" · "), media }),
  },
});

export const choiceOption = defineType({
  name: "choiceOption",
  title: "Lựa chọn",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Chữ hiển thị", type: "localeString" }),
    defineField({ name: "value", title: "Giá trị gửi trong email", type: "string", description: "Nên viết tiếng Anh, không đổi khi đã dùng.", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "value" }, prepare: ({ title, subtitle }) => ({ title: pick(title), subtitle }) },
});

export const choiceQuestion = defineType({
  name: "choiceQuestion",
  title: "Câu hỏi lựa chọn",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Câu hỏi", type: "localeString" }),
    defineField({ name: "options", title: "Các lựa chọn", type: "array", of: [{ type: "choiceOption" }] }),
  ],
});
