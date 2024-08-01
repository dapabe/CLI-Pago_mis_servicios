import { RepoEnvSchema } from "@repo/env-types";

export const TypedEnv = RepoEnvSchema
  .pick({ env: true, backend_endpoint: true })
  .parse({
    env: process.env.NODE_ENV,
    backend_endpoint: process.env.BACKEND_ENDPOINT
  })
