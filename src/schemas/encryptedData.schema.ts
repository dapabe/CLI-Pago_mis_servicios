import {
	type IValidVersions,
	type SchemaUtilities,
	ZodSchemaManager,
} from "@/utils/ZodSchemaManager";
import pkg from "package.json";
import { z } from "zod";
import { ZodSemverUnbranded } from "zod-semver";


type LastV = "0.0.0"

/**
 * Encrypted application data.
 */
class EncryptedDataSchema
	extends ZodSchemaManager<typeof EncryptedDataSchema, LastV>
	implements SchemaUtilities {

	static "0.0.0" = z.object({
		version: ZodSemverUnbranded.default(pkg.version),
		salt: z.string(),
		encryptedData: z.string(),
	});

	constructor() {
		super(EncryptedDataSchema, "0.0.0")
	}

	getLastSchema() {
		return EncryptedDataSchema[this.getLastVersion()]
	}
}

export const EncryptedDataManager = new EncryptedDataSchema();

export type IEncryptedData<V extends IValidVersions<typeof EncryptedDataSchema> = LastV> = z.TypeOf<
	typeof EncryptedDataSchema[V]
>;
