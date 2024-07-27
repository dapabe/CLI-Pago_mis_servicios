
interface RepoEnvs {
  NODE_ENV: "development" | "production",

  SERVER_HOST: string
  SERVER_PORT: string
  DB_URL: string
  DB_MASTER_TOKEN: string
  DB_COMMON_TOKEN: string

  BACKEND_ENDPOINT: string
}

declare namespace NodeJS {
  interface ProcessEnv extends Partial<RepoEnvs> { }
}