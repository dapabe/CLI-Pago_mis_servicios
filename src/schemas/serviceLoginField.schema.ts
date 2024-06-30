import { z } from 'zod';
import { StoredPaymentMethodSchema } from './paymentMethod.schema';

const S = z.string().default('');

export class ServiceLoginFieldsSchema {
  static '0.0.0' = z.object({
    username: S,
    password: S,
  });

  static '0.0.1' = this['0.0.0'].extend({
    payAlias: StoredPaymentMethodSchema.getLastSchema()
      .pick({ payAlias: true })
      .shape.payAlias.nullable()
      .default(null),
  });

  static getLastSchema() {
    return this['0.0.1'];
  }
}
