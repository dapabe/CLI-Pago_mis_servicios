
interface RepoEnvs { }

declare namespace NodeJS {
  interface ProcessEnv extends Partial<RepoEnvs> { }
}