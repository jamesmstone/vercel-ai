import * as mathjs from "mathjs";
import { parameters } from "@/app/api/tools/calculate/parameters";
import { SECRET_HEADER } from "@/app/constants";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (req.headers.get(SECRET_HEADER) !== process.env.SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await req.json();
  const { expression } = parameters.parse(json);

  return new Response(mathjs.evaluate(expression).toString(), { status: 200 });
}
