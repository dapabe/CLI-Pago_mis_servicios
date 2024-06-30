import { z } from 'zod';

/**
 * 	Current supported services to login to.
 */
export const SupportedServices = z.enum(['Aysa', 'Edesur', 'Telecentro']);

export type ISupportedServices = z.TypeOf<typeof SupportedServices>;
