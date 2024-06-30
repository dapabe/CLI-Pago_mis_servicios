import { z } from "zod";
import { ZodSemverUnbranded } from "zod-semver";

export const EncryptedDataSchema = z.object({
	version: ZodSemverUnbranded,
	salt: z.string(),
	encryptedData: z.string(),
});

export type IEncryptedData = z.TypeOf<typeof EncryptedDataSchema>;
