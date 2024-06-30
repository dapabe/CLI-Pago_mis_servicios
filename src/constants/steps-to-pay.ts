import { StepsToAnything } from '@/types/generic';
import { SupportedServices } from './services';

export const StepsToPay: Required<StepsToAnything> = {
  [SupportedServices.Aysa]: [],
  [SupportedServices.Edesur]: [],
  [SupportedServices.Telecentro]: ['div.hidden button[type=button]'],
};
