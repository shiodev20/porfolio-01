import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes, singletons } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "missing-project-id";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

const singletonIds = new Set(singletons.map((s) => s.id));
const singletonTypes = new Set(["siteSettings", "homePage", "portfolioPage", "contactPage", "programPage"]);

const structure = (S: StructureBuilder) =>
  S.list()
    .title("Nội dung")
    .items([
      ...singletons.map((s) =>
        S.listItem().title(s.title).id(s.id).child(S.document().schemaType(s.type).documentId(s.id).title(s.title)),
      ),
      S.divider(),
      S.documentTypeListItem("careerStage").title("Giai đoạn sự nghiệp"),
      S.documentTypeListItem("educationGroup").title("Nhóm học vấn"),
    ]);

export default defineConfig({
  name: "default",
  title: "Thao Portfolio",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "+" menu
    templates: (templates) => templates.filter((t) => !singletonTypes.has(t.schemaType ?? "")),
  },
  document: {
    // Singletons: no duplicate / delete
    actions: (actions, { documentId }) =>
      documentId && singletonIds.has(documentId) ? actions.filter((a) => !["duplicate", "delete", "unpublish"].includes(a.action ?? "")) : actions,
  },
});
