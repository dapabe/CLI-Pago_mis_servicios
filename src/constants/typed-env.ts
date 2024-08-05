import { z } from "zod";

export const EnvSchema = z.object({
	stage: z.enum(["development", "production"]).default("development"),
	backend_endpoint: z.string().url(),
});

export type IEnvSchema = z.TypeOf<typeof EnvSchema>;
