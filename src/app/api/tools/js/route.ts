import { parameters } from "@/app/api/tools/js/parameters";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (req.headers.get("x-secret") !== process.env.SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // clear env vars
  process.env = { NODE_ENV: process.env.NODE_ENV };

  const json = await req.json();
  const { src } = parameters.parse(json);

  try {
    return new Response(eval(src).toString(), { status: 200 });
  } catch (e: unknown) {
    return new Response(JSON.stringify(e), { status: 400 });
  }
}
