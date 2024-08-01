import { RepoEnvSchema } from "@repo/env-types";
import type { } from "@repo/env-types";

export const TypedEnv = RepoEnvSchema.pick({
  env: true,
  host: true,
  port: true,
  db_url: true,
  db_m_token: true,
  db_c_token: true
}).parse({
  env: process.env.NODE_ENV,
  host: process.env.SERVER_HOST,
  port: process.env.SERVER_PORT,
  db_url: process.env.DB_URL,
  db_m_token: process.env.DB_MASTER_TOKEN,
  db_c_token: process.env.DB_COMMON_TOKEN
})
