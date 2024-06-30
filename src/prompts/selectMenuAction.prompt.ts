import { SafeExitMessage } from '@/constants/random.js';
import { cancel, isCancel, select } from '@clack/prompts';
import { exit } from 'process';
import { IUserData } from '../schemas/userData.schema.js';
//
export async function selectMenuActionPrompt(userData: IUserData) {
  const noServices = !Object.keys(userData.serviceFields).length;

  const answer = await select({
    message: '¿Qué quieres hacer?',
    initialValue: 'next',
    options: [
      {
        name: 'Siguiente',
        value: 'next',
        description: 'Ver que si adeudo dinero de mis servicios seleccionados.',
        disabled: noServices,
      },
      {
        name: 'Mis datos',
        value: 'serviceFields',
        description:
          'Modifica los campos de inicio de sesión de servicios que uses.',
      },
      {
        name: 'Cambiar contraseña',
        value: 'password',
      },
      // {
      // 	name: "Metodos de pago",
      // 	value: "paymentMethods",
      // 	description: "Modifica tus metodos de pago",
      // },
      {
        name: 'Salir',
        value: 'exit',
        description: 'Termina el programa.',
      },
    ],
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }
  return answer;
}
