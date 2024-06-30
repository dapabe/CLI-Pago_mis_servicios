import { z } from 'zod';
import { StoredPaymentMethodSchema } from './paymentMethod.schema.js';
import { UserServiceFieldSchema } from './userServiceField.schema.js';

export class UserDataSchema {
  static '0.0.0' = z.object({
    serviceFields: UserServiceFieldSchema['0.0.0'],
  });

  static '0.0.1' = this['0.0.0'].merge(
    z.object({
      serviceFields: UserServiceFieldSchema.getLastSchema(),
      paymentMethods: StoredPaymentMethodSchema.getLastSchema()
        .optional()
        .array()
        .default([]),
    }),
  );

  static getLastSchema() {
    return this['0.0.1'];
  }
}
