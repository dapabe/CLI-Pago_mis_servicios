import {
	type IValidVersions,
	type SchemaUtilities,
	ZodSchemaManager,
} from "#/utils/ZodSchemaManager";
import pkg from "package.json";
import { z } from "zod";
import { ZodSemverUnbranded } from "zod-semver";

/**
 * Encrypted application data.
 */
export class EncryptedDataSchema
	extends ZodSchemaManager<"0.0.0", typeof EncryptedDataSchema>
	implements SchemaUtilities {
	static "0.0.0" = z.object({
		version: ZodSemverUnbranded.default(pkg.version),
		salt: z.string(),
		encryptedData: z.string(),
	});

	constructor() {
		super(EncryptedDataSchema);
	}

	getLastSchema() {
		return EncryptedDataSchema[this.getLastVersion()];
	}
}

export const EncryptedDataManager = new EncryptedDataSchema();

type T = typeof EncryptedDataSchema;

export type IEncryptedData<V extends IValidVersions<T> = "0.0.0"> = z.TypeOf<
	T[V]
>;
