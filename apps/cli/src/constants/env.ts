import { z } from "zod";

const envSchema = z.object({
  node_env: z.enum(["development", "production"]).default("development"),
  backend_endpoint: z.string().url().default("localhost:3000/api/v1")
})

export const env = envSchema.parse({
  node_env: process.env.NODE_ENV,
  backend_endpoint: process.env.BACKEND_ENDPOINT
})
