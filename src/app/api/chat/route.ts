import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import * as mathjs from "mathjs";
import { z } from "zod";
import { DateTime } from "luxon";

const JINA_API_KEY = process.env.JINA_API_KEY;

export const maxDuration = 27; // vercel has a 30 sec limit
const maxSteps = 10;

const getTimeInTimeZoneExecute = async ({ timezone }: { timezone: string }) => {
  try {
    const now = DateTime.now().setZone(timezone);
    if (!now.isValid) throw new Error(`Invalid timezone: ${timezone}`);
    return now.toFormat("yyyy-MM-dd HH:mm:ss");
  } catch (error: unknown) {
    return `Error: ${(error as Error).message}`;
  }
};

const getTimeInTimezone = tool({
  description:
    "A tool to get the current time in a specified timezone. Input the timezone in IANA format (e.g., 'America/New_York', 'Europe/London').",
  parameters: z.object({ timezone: z.string() }),
  execute: getTimeInTimeZoneExecute,
});

const calculate = tool({
  description:
    "A tool for evaluating mathematical expressions. Example expressions: " +
    "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
  parameters: z.object({ expression: z.string() }),
  execute: async ({ expression }) => mathjs.evaluate(expression),
});

const readUrl = tool({
  description: "Load public url and return the content.",
  parameters: z.object({ url: z.string() }),
  execute: async ({ url }) => {
    if (!url.startsWith("https://") || !url.startsWith("http://")) {
      return "Error: Invalid URL. Please ensure it starts with 'https://' or 'http://'";
    }
    const fetchUrl = `https://r.jina.ai/${url}`;
    try {
      const response = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${JINA_API_KEY}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      return await response.text();
    } catch (error: unknown) {
      return `Error: ${(error as Error).message}`;
    }
  },
});

const searchWeb = tool({
  description: "Perform a web search and return the results",
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const encodedQuery = encodeURIComponent(query);
    const fetchUrl = `https://s.jina.ai/${encodedQuery}`;
    try {
      const response = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${JINA_API_KEY}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      return await response.text();
    } catch (error: unknown) {
      return `Error: ${(error as Error).message}`;
    }
  },
});

const groundStatement = tool({
  description: "Ground a statement with web knowledge and return the results",
  parameters: z.object({ statement: z.string() }),
  execute: async ({ statement }) => {
    const encodedStatement = encodeURIComponent(statement);
    const fetchUrl = `https://g.jina.ai/${encodedStatement}`;
    try {
      const response = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${JINA_API_KEY}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      return await response.text();
    } catch (error: unknown) {
      return `Error: ${(error as Error).message}`;
    }
  },
});

const system = `You are James' helpful assistant. The current time in Copenhagen, where he lives is ${getTimeInTimeZoneExecute({ timezone: "Europe/Copenhagen" })}. Don't make up facts, search and ground them.`;

export async function POST(req: Request) {
  if (req.headers.get("x-secret") !== process.env.SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini", { structuredOutputs: true }),
    tools: {
      getTimeInTimezone,
      calculate,
      readUrl,
      searchWeb,
      groundStatement,
    },
    system,
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
