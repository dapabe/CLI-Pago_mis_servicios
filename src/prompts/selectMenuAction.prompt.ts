import { SafeExitMessage } from '@/constants/random.js';
import { IUserData } from '@/schemas/userData.schema';
import { IEditAction, IPromptAction } from '@/types/generic.js';
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
              'Tienes que agregar al menos 1 cuenta para ver y pagar tu servicio',
            )
          : 'Ver ultimas facturas o si adeudo dinero de mis servicios seleccionados.',
      },
      {
        label: 'Mis cuentas',
        value: 'serviceFields',
        hint: 'Añade o modifica tus cuentas.',
      },
      {
        label: noPayMethods
          ? picocolors.yellow('Metodos de pago')
          : 'Metodos de pago',
        value: 'paymentMethods',
        hint: `Añade, elimina o modifica tus metodos de pago. ${noPayMethods ? picocolors.yellow('[Necesitas al menos 1 para efectuar pagos]') : ''}`,
      },
      {
        label: `Modo seguro: ${userData.secureMode ? picocolors.green("Activado") : `${picocolors.red("Desactivado")} - ${picocolors.yellow("[Ten cuidado a quien muestras tus datos]")}`}`,
        value:"secureMode",
        hint: "Oculta o no el valor de los campos con información sensible"
      },
      {
        label: 'Cambiar contraseña',
        value: 'password',
      },
      {
        label: 'Salir',
        value: 'exit',
        hint: 'Termina el programa',
      },
    ],
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }
  return answer;
}
