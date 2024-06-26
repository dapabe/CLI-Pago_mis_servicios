import { SafeExitMessage } from '@/constants/random.js';
import { IEditAction, IPromptAction } from '@/types/generic.js';
import { IUserData } from '@/types/releases';
import { cancel, isCancel, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';

export async function selectMenuActionPrompt(
  userData: IUserData,
  firstTime: boolean,
) {
  const noPayMethods = !userData.paymentMethods.length;
  const answer = await select<any, IPromptAction | IEditAction | 'password'>({
    message: '¿Qué quieres hacer?',
    initialValue: firstTime ? 'serviceFields' : 'next',
    options: [
      {
        label: firstTime
          ? picocolors.red('Ir a mis páginas')
          : 'Ir a mis páginas',
        value: 'next',
        hint: firstTime
          ? picocolors.yellow(
              'Tienes que agregar al menos 1 cuenta para ver tu factura',
            )
          : 'Ver ultimas facturas o si adeudo dinero de mis servicios seleccionados.',
      },
      {
        label: 'Mis cuentas',
        value: 'serviceFields',
        hint: 'Añade, elimina o modifica tus cuentas.',
      },
      {
        label: noPayMethods
          ? picocolors.yellow('Metodos de pago')
          : 'Metodos de pago',
        value: 'paymentMethods',
        hint: `Añade, elimina o modifica tus metodos de pago. ${noPayMethods ? picocolors.yellow('[Necesitas al menos 1 para efectuar pagos]') : ''}`,
      },
      {
        label: 'Cambiar contraseña',
        value: 'password',
      },
      {
        label: 'Salir',
        value: 'exit',
        hint: 'Termina el programa.',
      },
    ],
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }
  return answer;
}
