import { StepsToAnything } from '@/types/generic';
import { SupportedServices } from './services';

/**
 * 	For sequential steps to enter login page. \
 * 	Some pages dont need this.
 */
export const StepsToLogin: StepsToAnything = {
  [SupportedServices.enum.Aysa]: ['#__link1', '#__button13'],
};
