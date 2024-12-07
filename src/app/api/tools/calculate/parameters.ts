import { z } from "zod";

export const parameters = z.object({ expression: z.string() });
