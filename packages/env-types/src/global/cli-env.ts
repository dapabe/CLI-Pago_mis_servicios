/// <reference path="./base-env.ts" />

interface RepoEnvs {
  BACKEND_ENDPOINT: string
}

declare namespace NodeJS {
  interface ProcessEnv extends Partial<RepoEnvs> { }
}