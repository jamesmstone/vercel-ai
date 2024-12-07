import * as mathjs from "mathjs";
import { parameters } from "@/app/api/tools/calculate/parameters";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (req.headers.get("x-secret") !== process.env.SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await req.json();
  const { expression } = parameters.parse(json);

  return new Response(mathjs.evaluate(expression).toString(), { status: 200 });
}
