interface RepoEnvs {
  // Global
  NODE_ENV: "development" | "production" | "backoffice",
}

declare namespace NodeJS {
  interface ProcessEnv extends Partial<RepoEnvs> { }
}