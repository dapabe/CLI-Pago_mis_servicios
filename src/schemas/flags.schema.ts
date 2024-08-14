import { ZodSchemaManager, type IValidVersions, type SchemaUtilities } from "@/utils/ZodSchemaManager";
import { z } from "zod";



type LastV = "0.0.0"

class FlagConfigSchema extends ZodSchemaManager<typeof FlagConfigSchema, LastV> implements SchemaUtilities {

  static "0.0.0" = z.object({
    secure: z.boolean().default(true),
    headless: z.boolean().default(true)
  });

  constructor() {
    super(FlagConfigSchema, "0.0.0")
  }
  getLastSchema() {
    return FlagConfigSchema[this.getLastVersion()]
  }
}

export const FlagConfigManager = new FlagConfigSchema()

export type IFlagConfig<V extends IValidVersions<typeof FlagConfigSchema> = LastV> = z.TypeOf<typeof FlagConfigSchema[V]>