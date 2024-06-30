import { SafeExitMessage } from '@/constants/random.js';
import { ISupportedServices } from '@/constants/services';
import { cancel, isCancel, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';

type BillContext = {
  service: ISupportedServices;
  amount: string | null;
  paid: boolean;
  lastDate: Date;
};

export async function chooseBillToPayPrompt(
  availableWebsAndBill: BillContext[],
) {
  const labelStatus = ({ amount, paid, service }: BillContext) => {
    if (!amount) return picocolors.red(service);
    if (paid) return picocolors.green(service);
    return service;
  };
  const hintStatus = ({ amount, paid, lastDate }: BillContext) => {
    if (!amount)
      return picocolors.yellow(
        'Ha ocurrido un error, no se ha podido encontrar con el monto a pagar, ponganse en contacto con el creador y indique cual servicio genera el problema',
      );
    if (paid)
      return `${picocolors.underline('Pagado')}: ${amount} - ${lastDate}`;
    return `Sin pago, ${amount}- ${lastDate}`;
  };
  const answer = await select<any, 'exit' | 'all' | ISupportedServices>({
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
      ...availableWebsAndBill.map((ctx) => ({
        label: labelStatus(ctx),
        value: ctx.service,
        hint: hintStatus(ctx),
      })),
    ],
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }

  return answer;
}
