import { runAgent } from "./agent.ts";

const prompt = process.argv.slice(2).join(" ").trim();
if (!prompt) {
  console.error("Usage: pnpm runner-cli:run <prompt>");
  process.exit(1);
}

const outcome = await runAgent(prompt);
console.log(outcome.text);
