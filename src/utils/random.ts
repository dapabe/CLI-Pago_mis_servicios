import { ISupportedServices } from '@/constants/services';
import { IUserData } from '@/types/releases';

export function retrieveFromSelectedFilledForms(userData: IUserData) {
  return (
    Object.entries(userData.serviceFields)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, fields]) => Object.values(fields).every(Boolean))
      .map((x) => ({ service: x[0] as ISupportedServices, fields: x[1] }))
  );
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
