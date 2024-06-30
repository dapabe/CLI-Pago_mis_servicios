import { z } from 'zod';
import { UserServicesFieldsSchema } from './enterpriseFields.schema.js';

/**
 *  TODO: fix this.
 *  On .parse, this schema should populate missing fields AND create missing ones too.
 */
export const UserDataSchema = z.object({
  /**
   *	Login form fields
   */
  serviceFields: UserServicesFieldsSchema,
  // paymentMethods:
});

export type IUserData = z.TypeOf<typeof UserDataSchema>;
