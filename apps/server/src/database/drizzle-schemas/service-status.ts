import { boolean, integer, pgTable, serial } from "drizzle-orm/pg-core"
import { TABLE_NAMES } from "../tables"
import { relations } from "drizzle-orm"
import { ServiceNameSchema } from "./service-names"

export const ServiceOnRevisionSchema = pgTable(TABLE_NAMES.servicesOnRevision, {
  id: serial("id").primaryKey(),
  idService: integer("idService").notNull(),
  onRevision: boolean("onRevision").default(true)
})

export const serviceOnRevisionRel = relations(ServiceOnRevisionSchema, ({ one }) => ({
  serviceName: one(ServiceNameSchema, { fields: [ServiceOnRevisionSchema.idService], references: [ServiceNameSchema.id] })
}))
