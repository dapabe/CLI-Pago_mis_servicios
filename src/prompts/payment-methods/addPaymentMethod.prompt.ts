import { SafeExitMessage } from '@/constants/random';
import { StoredPaymentMethodSchema } from '@/schemas/paymentMethod.schema';
import { IStoredPaymentMethod, IUserData } from '@/types/releases';

import { ISupportedServices } from '@/types/generic';
import * as prompt from '@clack/prompts';
import { addPaymentAliasPrompt } from './addPaymentAlias.prompt';

export async function addPaymentMethodPrompt(
  userData: IUserData,
  payMethod?: Partial<IStoredPaymentMethod>,
): Promise<void> {
  const group = await prompt.group(
    {
      fullName: () =>
        prompt.text({
          message: 'Nombre completo',
          initialValue: payMethod?.fullName ?? '',
          validate: (x) =>
            StoredPaymentMethodSchema.getLastSchema().shape.fullName.safeParse(
              x,
            ).error?.errors[0].message,
        }),
      frontNumber: () =>
        prompt.text({
          message: 'Número de la targeta',
          placeholder: '0000 0000 0000 0000',
          initialValue: payMethod?.frontNumber ?? '',
          validate: (x) =>
            StoredPaymentMethodSchema.getLastSchema().shape.frontNumber.safeParse(
              x,
            ).error?.errors[0].message,
        }),
      expireDate: () =>
        prompt.text({
          message: 'Fecha de vencimiento',
          placeholder: '01/29',
          initialValue: payMethod?.expireDate ?? '',
          validate: (x) =>
            StoredPaymentMethodSchema.getLastSchema().shape.expireDate.safeParse(
              x,
            ).error?.errors[0].message,
        }),
      backNumber: () =>
        prompt.text({
          message: 'Clave de seguridad (CCV)',
          placeholder: '000',
          initialValue: payMethod?.backNumber ?? '',
          validate: (x) =>
            StoredPaymentMethodSchema.getLastSchema().shape.backNumber.safeParse(
              x,
            ).error?.errors[0].message,
        }),
    },
    {
      async onCancel() {
        prompt.log.warning(SafeExitMessage);
      },
    },
  );

  const payAlias = await addPaymentAliasPrompt(payMethod?.payAlias);
  //  If payMethod exists then is modifying info, else adding info.
  if (payMethod) {
    const toReplace = userData.paymentMethods.find(
      (x) => x!.payAlias === payMethod.payAlias,
    )!;
    userData.paymentMethods = [
      ...userData.paymentMethods.filter(
        (x) => x!.payAlias !== payMethod.payAlias,
      ),
      { ...toReplace, payAlias },
    ];

    //  Execute changes in services

    for (const service of Object.keys(
      userData.serviceFields,
    ) as ISupportedServices[]) {
      userData.serviceFields[service]!.payAlias = payAlias;
    }
  } else {
    userData.paymentMethods.push({ ...group, payAlias });
  }
}
