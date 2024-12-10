import { z } from "zod";

export const parameters = z.object({ src: z.string() });
