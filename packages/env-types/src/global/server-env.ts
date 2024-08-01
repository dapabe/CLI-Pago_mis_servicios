/// <reference path="./base-env.ts" />

interface RepoEnvs {
  SERVER_HOST: string
  SERVER_PORT: string
  DB_URL: string
  DB_MASTER_TOKEN: string
  DB_COMMON_TOKEN: string
}

declare namespace NodeJS {
  interface ProcessEnv extends Partial<RepoEnvs> { }
}