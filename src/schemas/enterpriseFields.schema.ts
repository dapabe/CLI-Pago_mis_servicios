import { SupportedServices } from '@/constants/services';
import { z } from 'zod';

const S = z.string().default('');
export const ServiceLoginFields = z
  .object({
    username: S,
    password: S,
  })
  .optional();

/**
 * 	Find a way to create this object exponentially as `SupportedServices` \
 * 	grows that is type safe.
 */
export const UserServicesFieldsSchema = z
  .object({
    [SupportedServices.Aysa]: ServiceLoginFields,
    [SupportedServices.Edesur]: ServiceLoginFields,
    [SupportedServices.Telecentro]: ServiceLoginFields,
  })
  .default({});

export type IServiceLoginFields = z.TypeOf<typeof ServiceLoginFields>;
export type IUserServicesFields = z.TypeOf<typeof UserServicesFieldsSchema>;
