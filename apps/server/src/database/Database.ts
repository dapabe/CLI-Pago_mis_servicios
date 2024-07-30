import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schemas from "./drizzle-schemas/index";

export type DbConnection = ReturnType<typeof Database.startConnection>

export class Database {
  static #CLIENT = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_MASTER_TOKEN,
  });
  static CONN: DbConnection | null = null

  static startConnection() {
    return drizzle(Database.#CLIENT, { schema: { ...schemas.ServiceNameSchema } });
  }


  async populateDatabase() {
    // for (const name of Object.values(TABLE_NAMES)) {
    //   await this.CL.execute(`CREATE TABLE IF NOT EXISTS ${name}`)
    // }
    // for (const name of Object.values(TEST_TABLE_NAMES)) {
    //   await this.CL.execute(`CREATE TABLE IF NOT EXISTS ${name}`)
    // }
  }
}
