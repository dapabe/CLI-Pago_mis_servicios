import { z } from 'zod';

export class EncryptedDataSchema {
  static '0.0.0' = z.object({
    version: z.string(),
    salt: z.string(),
    encryptedData: z.string(),
  });

  static getLastSchema() {
    return this['0.0.0'];
  }
}
