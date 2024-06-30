import { StepsToAnything } from '@/types/generic';
import { SupportedServices } from './services';

/**
 * 	The last step MUST contain the innerHTML of the bill amount.
 */
export const StepsToLastBill: Required<StepsToAnything> = {
  [SupportedServices.enum.Aysa]: [],
  [SupportedServices.enum.Edesur]: [],
  [SupportedServices.enum.Telecentro]: [],
};
