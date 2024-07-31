
interface RepoEnvs {
  // Global
  NODE_ENV: "development" | "production" | "backoffice",

  //  SERVER
  SERVER_HOST: string
  SERVER_PORT: string
  DB_URL: string
  DB_MASTER_TOKEN: string
  DB_COMMON_TOKEN: string

  //  CLI
  BACKEND_ENDPOINT: string
}

declare namespace NodeJS {
  interface ProcessEnv extends Partial<RepoEnvs> { }
}