import { ISupportedServices } from '@/constants/services';
import { IServiceLoginFields } from '@/schemas/serviceLoginField.schema';
import { IUserData } from '@/schemas/userData.schema';
import { ZodError } from 'zod';

export function retrieveFromSelectedFilledForms(userData: IUserData) {
  return (
    Object.entries(userData.serviceFields)
      .filter(([_, fields]) => Object.values(fields).every(Boolean))
      .map((x) => ({ service: x[0] as ISupportedServices, fields: x[1] }))
  );
}

export function hastAtLeastOneLoginFilled(userData:IUserData){
  const stripped = (Object.entries(userData.serviceFields) as [ISupportedServices,IServiceLoginFields][])
  .map(([_,{aliasRef,...fields}])=> fields)
return Boolean(stripped.filter(x=> Object.values(x).every(Boolean)).length)
}

// type D<ZSchema> = {
//   data: unknown;
//   fromVersion: IValidVersionKeys<ZSchema>;
//   toVersion: IValidVersionKeys<ZSchema>;
//   upperSchema: ZSchema;
// };
// export function genericMigration<ZC>({
//   data,
//   fromVersion,
//   toVersion,
//   upperSchema,
// }: D<ZC>) {
//   const currentV = fromVersion;
// }

export function conjunctionList(s: string[]) {
  return new Intl.ListFormat('es-ES', { type: 'conjunction' }).format(s);
}


export function mapZodErrors(err: ZodError){
  return conjunctionList(err.issues.map(x=>x.message))
}
