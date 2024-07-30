
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production",

    SERVER_HOST: string
    SERVER_PORT: string
    DB_URL: string
    DB_MASTER_TOKEN: string
    DB_READ_TOKEN: string
  }
}
