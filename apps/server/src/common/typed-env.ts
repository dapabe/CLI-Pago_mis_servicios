import { z } from "zod";


export const envSchema = z.object({
  env: z.enum(["development", "production", "backoffice"]).default("development"),
  host: z.string().trim().default("localhost"),
  port: z.coerce.number().default(3000),
  db_url: z.string().url(),
  db_m_token: z.string().trim().min(1),
  db_c_token: z.string().trim().min(1),
})

export const TypedEnv = envSchema.parse({
  env: process.env.NODE_ENV,
  host: process.env.SERVER_HOST,
  port: process.env.SERVER_PORT,
  db_url: process.env.DB_URL,
  db_m_token: process.env.DB_MASTER_TOKEN,
  db_c_token: process.env.DB_COMMON_TOKEN
})
