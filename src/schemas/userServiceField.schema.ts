import { SupportedServices } from '@/constants/services';
import { z } from 'zod';
import { ServiceLoginFieldsSchema } from './serviceLoginField.schema';
/**
 * 	Find a way to create this object exponentially as `SupportedServices` \
 * 	grows that is type safe and scalable.
 */
export class UserServiceFieldSchema {
  static '0.0.0' = z
    .object({
      [SupportedServices.enum.Aysa]:
        ServiceLoginFieldsSchema['0.0.0'].optional(),
      [SupportedServices.enum.Edesur]:
        ServiceLoginFieldsSchema['0.0.0'].optional(),
      [SupportedServices.enum.Telecentro]:
        ServiceLoginFieldsSchema['0.0.0'].optional(),
    })
    .default({});

  static '0.0.1' = z
    .object({
      [SupportedServices.enum.Aysa]:
        ServiceLoginFieldsSchema.getLastSchema().optional(),
      [SupportedServices.enum.Edesur]:
        ServiceLoginFieldsSchema.getLastSchema().optional(),
      [SupportedServices.enum.Telecentro]:
        ServiceLoginFieldsSchema.getLastSchema().optional(),
    })
    .default({});

  static getLastSchema() {
    return this['0.0.1'];
  }
}
