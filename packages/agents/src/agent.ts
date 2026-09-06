import { Agent, type AgentOutcome } from "@anvia/core";
import { OpenAIClient } from "@anvia/openai";
import { instructions } from "./prompt.ts";
import { searchWeb } from "./tools/search-web.ts";

export function createSuperAssistant(): Agent {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const model = new OpenAIClient({
    apiKey,
    // empty string in .env must fall back to the SDK default endpoint
    baseUrl: process.env.OPENAI_BASE_URL || undefined,
  }).completionModel({
    modelId: "gpt-5.6-luna",
    api: "chat",
  });

  return new Agent({
    id: "superassistant",
    name: "SuperAssistant",
    description: "Discord super assistant",
    instructions,
    model,
    tools: [searchWeb],
  });
}

export async function runAgent(prompt: string): Promise<AgentOutcome> {
  return createSuperAssistant().generate({ prompt });
}
