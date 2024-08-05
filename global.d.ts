
interface Envs {
  NODE_ENV: "development" | "production"
  BACKEND_ENDPOINT: string
}

declare namespace NodeJS {
  interface ProcessEnv extends Partial<Envs> { }
}