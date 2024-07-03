import { ISupportedServices } from '@/constants/services';
import { IServiceLoginFields } from '@/schemas/serviceLoginField.schema';
import { IUserData } from '@/schemas/userData.schema';
import { ZodError } from 'zod';


export function getServicesWithFilledLogins(userData:IUserData){
  const stripped = (Object.entries(userData.serviceFields) as [ISupportedServices,IServiceLoginFields][])
  .map(([service,{aliasRef,...fields}])=> ({service, fields}))
return stripped.filter(x=> Object.values(x.fields).every(Boolean))
}

export function getServicesWithAllFilledLogins(userData:IUserData){
  const stripped = (Object.entries(userData.serviceFields) as [ISupportedServices,IServiceLoginFields][])
    .map(x=> ({service: x[0], fields: x[1]}))
  return stripped.filter((x) => Object.values(x.fields).every(Boolean))
}

export function conjunctionList(s: string[]) {
  return new Intl.ListFormat('es-ES', { type: 'conjunction' }).format(s);
}

export function mapZodErrors(err: ZodError){
  return conjunctionList(err.issues.map(x=>x.message))
}
