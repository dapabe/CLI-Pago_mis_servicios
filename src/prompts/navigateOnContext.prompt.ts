import { SafeExitMessage } from '@/constants/random.js';
import { ISupportedServices } from '@/types/generic';
import { cancel, isCancel, select } from '@clack/prompts';
import { exit } from 'process';

// Exclude<IPromptAction, 'next'> | 'all' | IServices

export async function navigateOnContextPrompt(
  availableWebs: ISupportedServices[],
) {
  const answer = await select({
    message:
      '¿Que pagaras hoy? - Luego de cada acción se mostrara el monto pagado.',
    initialValue: 'exit',
    options: [
      {
        label: 'Volver',
        value: 'exit',
        hint: 'Vuelve al menú anterior',
      },
      {
        label: 'Todo - Pagar todo',
        value: 'all',
        hint: 'Paga todas los impuestos y facturas pendientes con los respectivos metodos de pago',
      },
      ...availableWebs.map((x) => ({
        label: x,
        value: x,
        hint: `Ver servicio a pagar de '${x}'`,
      })),
    ],
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }

  return answer;
}
