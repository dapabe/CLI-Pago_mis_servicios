import { SafeExitMessage } from '@/constants/random';
import { ISupportedServices } from '@/constants/services';
import { IServiceLoginFields, ServiceLoginFieldsManager } from '@/schemas/serviceLoginField.schema';
import { IUserData } from '@/schemas/userData.schema';
import { TranslatedInput } from '@/utils/translation';
import { cancel, isCancel, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';
import { secureTextPrompt } from '../secureText.prompt';

export async function editSupportedServiceField(
  userData: IUserData,
  field: keyof IServiceLoginFields,
  service: ISupportedServices
) {
  const translated = picocolors.underline(TranslatedInput[field]);
  if (field === 'aliasRef') {
    const answer = await select<any, string>({
      message: `Elije un ${translated} que hayas creado`,
      initialValue: userData.serviceFields[service]!.aliasRef ?? "exit",
      options: [
        {
          label: 'Volver',
          value: 'exit',
        },
        ...Object.values(userData.paymentMethods).map((x) => ({
          label: picocolors.underline(x!.payAlias),
          value: x!.uuid,
        })),
      ],
    });

    if (isCancel(answer)) {
      cancel(SafeExitMessage);
      exit(0);
    }
    return answer;
  } else {
    const answer = await secureTextPrompt(userData.secureMode,{
      message: `Modificando datos de ${translated}`,
      validate:x=>
        ServiceLoginFieldsManager.getLastSchema().shape[field].safeParse(x).error
          ?.errors[0].message
    })
    return answer;
  }
}
