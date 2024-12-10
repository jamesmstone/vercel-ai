import { parameters } from "@/app/api/tools/js/parameters";

import CaptureConsole from "capture-console-logs";
import safeEval from "safe-eval";
import { SECRET_HEADER } from "@/app/constants";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (req.headers.get(SECRET_HEADER) !== process.env.SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await req.json();
  const { src } = parameters.parse(json);

  try {
    const cc = new CaptureConsole();

    cc.start();
    const context = {
      console: console,
    };
    const evaluation = safeEval(src, context);
    cc.stop();
    const captures = cc.getCaptures();
    const consoleResponse =
      captures.length === 0
        ? ""
        : "\n----\n\n console:\n" + JSON.stringify(captures);
    return new Response(`${evaluation}` + consoleResponse, { status: 200 });
  } catch (e: unknown) {
    return new Response(JSON.stringify(e), { status: 400 });
  }
}
