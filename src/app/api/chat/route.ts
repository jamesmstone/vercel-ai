import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { DateTime } from "luxon";

import { parameters as calculateParameters } from "@/app/api/tools/calculate/parameters";
import { SECRET_HEADER } from "@/app/constants";

const JINA_API_KEY = process.env.JINA_API_KEY;

export const runtime = "edge";
// edge has no limit, function have limits: see: https://vercel.com/docs/functions/runtimes#max-duration
export const maxDuration = 120;
const maxSteps = 10;

const getTimeInTimeZoneExecute = async ({ timezone }: { timezone: string }) => {
  const now = DateTime.now().setZone(timezone);
  if (!now.isValid) return `Invalid timezone: ${timezone}`;
  return now.toFormat("yyyy-MM-dd HH:mm:ss");
};

const getTimeInTimezone = tool({
  description:
    "A tool to get the current time in a specified timezone. Input the timezone in IANA format (e.g., 'America/New_York', 'Europe/Copenhagen').",
  parameters: z.object({ timezone: z.string() }),
  execute: getTimeInTimeZoneExecute,
});

const readUrl = tool({
  description: "Load public url and return the content.",
  parameters: z.object({ url: z.string() }),
  execute: async ({ url }) => {
    if (!url.startsWith("https://") || !url.startsWith("http://")) {
      return "Error: Invalid URL. Please ensure it starts with 'https://' or 'http://'";
    }
    const fetchUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${JINA_API_KEY}` },
    });
    if (!response.ok) {
      return `Failed to fetch: ${response.statusText}`;
    }
    return await response.text();
  },
});

const searchWeb = tool({
  description: "Perform a web search and return the results",
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const encodedQuery = encodeURIComponent(query);
    const fetchUrl = `https://s.jina.ai/${encodedQuery}`;
    const response = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${JINA_API_KEY}` },
    });
    if (!response.ok) {
      return `Failed to fetch: ${response.statusText}`;
    }
    return await response.text();
  },
});

const groundStatement = tool({
  description: "Ground a statement with web knowledge and return the results",
  parameters: z.object({ statement: z.string() }),
  execute: async ({ statement }) => {
    const encodedStatement = encodeURIComponent(statement);
    const fetchUrl = `https://g.jina.ai/${encodedStatement}`;
    const response = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${JINA_API_KEY}` },
    });
    if (!response.ok) {
      return `Failed to fetch: ${response.statusText}`;
    }
    return await response.text();
  },
});

const appendToDailyNote = tool({
  description: "Append markdown to James' daily note",
  parameters: z.object({ content: z.string() }),
  execute: async ({ content }) => {
    const response = await fetch(
      "https://ai.sgp.jamesst.one/append-to-daily-note",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: "-----\n\n" + content,
      },
    );
    if (!response.ok) {
      return `Failed to append to daily note: ${response.statusText}`;
    }
    return await response.text();
  },
});

const fetchOCRText = tool({
  parameters: z.object({}),
  description:
    "Fetch and return text from OCR of James' current computer screen.",
  execute: async () => {
    const response = await fetch("https://ai.nixos.sgp.jamesst.one/window-ocr");
    if (!response.ok) {
      return `Failed to fetch OCR text: ${response.statusText}`;
    }
    return await response.text();
  },
});

const system = `You are James' helpful assistant. The current time in Copenhagen, where he lives is ${getTimeInTimeZoneExecute({ timezone: "Europe/Copenhagen" })}. Don't make up facts, search and ground them. Be brief eg dont offer further help. ALWAYS link to sources.`;

type ToolParams = Parameters<typeof tool>;
type ExternalToolParams = Omit<ToolParams[0], "execute" | "description"> & {
  endpoint: string;
  origin: string;
  secret: string;
  description: string;
};
const getExternalTool = ({
  origin,
  endpoint,
  secret,
  description,
  parameters,
}: ExternalToolParams) =>
  tool({
    description,
    parameters,
    execute: async (params) => {
      const fetchUrl = `${origin}/api/tools/${endpoint}`;
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          SECRET_HEADER: secret,
        },
        body: JSON.stringify(params),
      });
      return await response.text();
    },
  });

const getCalculate = (origin: string, secret: string) =>
  getExternalTool({
    endpoint: "calculate",
    origin,
    secret,
    parameters: calculateParameters,
    description:
      "A tool for evaluating mathematical expressions. Example expressions: " +
      "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
  });
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin === null) throw new Error("Missing origin header");

  const secret = req.headers.get(SECRET_HEADER);
  console.log(secret, req.headers);
  if (secret !== process.env.SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini", {
      structuredOutputs: true,
      parallelToolCalls: true,
      downloadImages: true,
    }),
    tools: {
      getTimeInTimezone,
      calculate: getCalculate(origin, secret),
      readUrl,
      searchWeb,
      groundStatement,
      fetchOCRText,
      appendToDailyNote,
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
