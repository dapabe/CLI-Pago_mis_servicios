import { relations } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { ServiceOnRevisionSchema } from "./service-status";
import { TABLE_NAMES } from "../tables";


export const ServiceNameSchema = pgTable(TABLE_NAMES.serviceNames, {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
})


export const serviceNameRel = relations(ServiceNameSchema, ({ many }) => ({
  onRevisionRel: many(ServiceOnRevisionSchema)
}))