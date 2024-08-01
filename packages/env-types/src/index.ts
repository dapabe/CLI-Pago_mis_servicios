import { z } from "zod";

const defString = z.string().trim().min(1)
export const RepoEnvSchema = z.object({
  //  global
  env: z.enum(["development", "production", "backoffice"]).default("development"),

  //  server
  host: defString.default("localhost"),
  port: z.coerce.number().default(3000),
  db_url: z.string().url(),
  db_m_token: defString,
  db_c_token: defString,

  //  cli
  backend_endpoint: defString.default("localhost:3000/api/v1")
})