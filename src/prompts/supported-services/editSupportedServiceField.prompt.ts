import { SafeExitMessage } from '@/constants/random';
import { IServiceLoginFields, ServiceLoginFieldsManager } from '@/schemas/serviceLoginField.schema';
import { IUserData } from '@/schemas/userData.schema';
import { TranslatedInput } from '@/utils/translation';
import { cancel, isCancel, password, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';

export async function editSupportedServiceField(
  userData: IUserData,
  field: keyof IServiceLoginFields,
) {
  const translated = picocolors.underline(TranslatedInput[field]);
  if (field === 'aliasRef') {
    const answer = await select<any, string>({
      message: `Elije un ${translated} que hayas creado`,
      options: [
        {
          label: 'Volver',
          value: 'exit',
        },
        ...Object.values(userData.paymentMethods).map((x) => ({
          label: picocolors.underline(x!.payAlias),
          value: x!.payAlias,
        })),
      ],
    });

    if (isCancel(answer)) {
      cancel(SafeExitMessage);
      exit(0);
    }
    return answer;
  } else {
    const answer = await password({
      message: `Estas modificando la información de ${translated}`,
      mask: '',
      validate: (x) =>
        ServiceLoginFieldsManager.getLastSchema().shape[field].safeParse(x).error
          ?.errors[0].message,
    });
    if (isCancel(answer)) {
      cancel(SafeExitMessage);
      exit(0);
    }
    return answer;
  }
}
