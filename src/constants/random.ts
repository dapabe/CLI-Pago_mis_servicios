import { ServiceLoginFieldsSchema } from '@/schemas/serviceLoginField.schema';

export const generatedFileName = 'info.json' as const;

export const SafeExitMessage = 'Se ha cancelado la operación.';

export const RequiredServiceFieldAmount = Object.keys(
  ServiceLoginFieldsSchema.getLastSchema().shape,
).length;
