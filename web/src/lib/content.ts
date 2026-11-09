import { getDocument } from "./sanity";

export const getSettings = () => getDocument("siteSettings");
export const getHome = () => getDocument("homePage");
export const getContact = () => getDocument("contactPage");
export const getProgram = (id: "coursePage" | "aiToolPage") => getDocument(id);
export const getPortfolio = () =>
  getDocument("portfolioPage", `{..., "stages": stages[]->, "educationGroups": educationGroups[]->}`);
