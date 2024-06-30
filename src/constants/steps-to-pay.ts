import { StepsToAnything } from '@/types/generic';
import { SupportedServices } from './services';

export const StepsToPay: Required<StepsToAnything> = {
  [SupportedServices.enum.Aysa]: [],
  [SupportedServices.enum.Edesur]: [],
  [SupportedServices.enum.Telecentro]: ['div.hidden button[type=button]'],
};
