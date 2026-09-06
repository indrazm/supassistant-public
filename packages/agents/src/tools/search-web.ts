import { createTool } from "@anvia/core";
import { z } from "zod";
import { Exa } from "exa-js";

const exaApiKey = process.env.EXA_API_KEY;
if (!exaApiKey) {
  throw new Error("EXA_API_KEY is not set");
}
const exa = new Exa(exaApiKey);

export const searchWeb = createTool({
  name: "searchWeb",
  description:
    "Search the web with Exa. Returns a list of results with title, url, and publish date.",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    numResults: z.number().int().min(1).max(10).default(5).describe("How many results to return"),
  }),
  execute: async ({ query, numResults }) => {
    const response = await exa.search(query, { numResults, contents: false });
    return response.results.map((result) => ({
      title: result.title,
      url: result.url,
      publishedDate: result.publishedDate ?? null,
    }));
  },
});
