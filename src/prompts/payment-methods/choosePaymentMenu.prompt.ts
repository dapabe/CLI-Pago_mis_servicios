import { SafeExitMessage } from '@/constants/random';
import { ISupportedServices } from '@/types/generic';
import { IUserData } from '@/types/releases';
import { cancel, isCancel, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';
import { addPaymentMethodPrompt } from './addPaymentMethod.prompt';
import { deletePaymentMethodPrompt } from './deletePaymentMethod.prompt';

export async function choosePaymentMenuPrompt(userData: IUserData) {
  const aliases = userData.paymentMethods.map((x) => x!.payAlias);
  const answer = await select<
    any,
    'exit' | 'delete' | 'create' | ISupportedServices
  >({
    message: 'Metodos de pago',
    initialValue: !aliases.length ? 'create' : 'exit',
    options: [
      {
        label: 'Volver',
        value: 'exit',
      },
      {
        label: 'Añadir nuevo',
        value: 'create',
        hint: 'Añade un nuevo metodo de pago.',
      },
      {
        label: !aliases.length
          ? picocolors.red('Seleccionar y eliminar')
          : 'Seleccionar y eliminar',
        value: 'delete',
      },
      ...aliases.map((x) => ({
        label: x,
        value: x,
        hint: `Editar - ${picocolors.yellow('Se veran tus datos al editar, asegurate que nadie lo vea.')}`,
      })),
    ],
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }
  if (answer === 'exit') return await Promise.resolve();

  if (answer === 'delete') {
    if (!aliases.length) return await choosePaymentMenuPrompt(userData);
    const results = await deletePaymentMethodPrompt(aliases);
    if (results) {
      userData.paymentMethods = userData.paymentMethods.filter(
        (x) => !results.includes(x!.payAlias),
      );
      //  Delete references in services
      const refs = Object.entries(userData.serviceFields)
        .filter((x) => !results.includes(x[1].payAlias!))
        .map(([service, field]) => ({
          [service]: { ...field, payAlias: '' },
        }));
      console.log(refs);

      return await Promise.resolve();
    }
    return await choosePaymentMenuPrompt(userData);
  }

  if (answer === 'create') return await addPaymentMethodPrompt(userData);

  await addPaymentMethodPrompt(
    userData,
    userData.paymentMethods.find((x) => x?.payAlias === answer),
  );
}
