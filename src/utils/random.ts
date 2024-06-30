import { IUserData } from '@/schemas/userData.schema';
import { ISupportedServices } from '@/types/generic';

export function retrieveFromSelectedFilledForms(
  userData: IUserData,
): ISupportedServices[] {
  return (
    Object.entries(userData.serviceFields)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, fields]) => Object.values(fields).every(Boolean))
      .map((x) => x[0] as ISupportedServices)
  );
}
