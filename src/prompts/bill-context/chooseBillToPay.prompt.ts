import { SafeExitMessage } from '@/constants/random.js';
import { ISupportedServices } from '@/constants/services';
import { BillData } from '@/constants/steps-to-last-bill';
import { cancel, isCancel, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';

type BillContext = (BillData & {service:ISupportedServices})


export async function chooseBillToPayPrompt(
  availableWebsAndBill: BillContext[],
) {
  const labelStatus = ({ bill, paid, service }: BillContext) => {
    if (!bill) return picocolors.red(service);
    if (paid) return picocolors.green(service);
    return service;
  };
  const hintStatus = ({ bill, paid, expireDate }: BillContext) => {
    if (!bill)
      return picocolors.yellow(
        'Ha ocurrido un error, no se ha podido encontrar con el monto a pagar, ponganse en contacto con el creador y indique cual servicio genera el problema',
      );
    if (paid)
      return `${picocolors.underline('Pagado')}: ${bill} - ${expireDate}`;
    return `Monto a pagar: ${picocolors.underline(bill)} - Vencimiento: ${picocolors.yellow(expireDate)}`;
  };
  const answer = await select<any, 'exit' | 'all' | ISupportedServices>({
    message:
      '¿Que pagaras hoy?',
    initialValue: 'exit',
    options: [
      {
        label: 'Volver',
        value: 'exit',
        hint: 'Vuelve al menú anterior',
      },
      {
        label: `Todo - Total: ${picocolors.underline(availableWebsAndBill.reduce((prev,curr)=> prev + parseInt(curr.bill ?? "0") ,0))}`,
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
