import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { tool } from "ai";
import * as mathjs from "mathjs";
import { z } from "zod";
import { DateTime } from "luxon";

export const maxDuration = 27; // vercel has a 30 sec limit
const maxSteps = 10;

const getTimeInTimezone = tool({
  description:
    "A tool to get the current time in a specified timezone. Input the timezone in IANA format (e.g., 'America/New_York', 'Europe/London').",
  parameters: z.object({ timezone: z.string() }),
  execute: async ({ timezone }) => {
    try {
      const now = DateTime.now().setZone(timezone);
      if (!now.isValid) throw new Error(`Invalid timezone: ${timezone}`);
      return now.toFormat("yyyy-MM-dd HH:mm:ss");
    } catch (error: unknown) {
      return `Error: ${(error as Error).message}`;
    }
  },
});

export async function POST(req: Request) {
  if (req.headers.get("x-secret") !== process.env.SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-2024-08-06", { structuredOutputs: true }),
    tools: {
      getTimeInTimezone,
      calculate: tool({
        description:
          "A tool for evaluating mathematical expressions. Example expressions: " +
          "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
        parameters: z.object({ expression: z.string() }),
        execute: async ({ expression }) => mathjs.evaluate(expression),
      }),
    },
    maxSteps,
    messages,
    onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      console.debug(
        `Step finished: ${text} (${finishReason})`,
        toolCalls,
        toolResults,
        usage,
      );
    },
  });

  return result.toDataStreamResponse();
}
