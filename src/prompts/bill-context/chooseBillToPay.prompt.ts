import { SafeExitMessage } from '@/constants/random.js';
import { ISupportedServices } from '@/constants/services';
import { BillData } from '@/constants/steps-to-last-bill';
import { cancel, isCancel, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';

type BillContext = {service:ISupportedServices, data: BillData | null}


export async function chooseBillToPayPrompt(
  availableWebsAndBill: BillContext[],
) {
  const labelStatus = ({service,data}: BillContext) => {
    if (!data) return picocolors.red(service);
    if (!data.bill) return picocolors.yellow(service)
    if (data.paid) return picocolors.green(service);
    return service;
  };
  const hintStatus = ({data}: BillContext) => {
    if (!data) return picocolors.red("En revisión")
    if (!data.bill) return picocolors.yellow(
        'Ha ocurrido un error, no se ha podido encontrar con el monto a pagar, ponganse en contacto con el creador y indique cual servicio genera el problema',
      );
    if (data.paid)
      return `${picocolors.underline('Pagado')}: ${data.bill} - ${data.expireDate}`;
    return `Monto a pagar: ${picocolors.underline(data.bill)} - Vencimiento: ${picocolors.yellow(data.expireDate)}`;
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
        label: `Todo - Total: ${picocolors.underline(availableWebsAndBill.reduce((prev,curr)=> prev + parseInt(curr.data?.bill ?? "0"), 0))}`,
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
