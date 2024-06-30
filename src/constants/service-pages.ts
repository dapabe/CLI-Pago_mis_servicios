import { IServices } from '../types';
import { SupportedServices } from './services';

/**
 * 	Some pages will have to enter from another place \
 *  if this is the case then procced with `StepsToLogin` \
 * 	but in first place must be setted to `login` page.
 */
export const ServicePages: Record<IServices, string> = {
  [SupportedServices.Aysa]: 'https://oficinavirtual.web.aysa.com.ar/index.html',
  [SupportedServices.Edesur]: 'https://ov.edesur.com.ar/login',
  [SupportedServices.Telecentro]:
    'https://telecentro.com.ar/sucursal-virtual/login',
} as const;
