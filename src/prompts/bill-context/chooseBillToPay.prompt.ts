import { SafeExitMessage } from '@/constants/random.js';
import { ISupportedServices } from '@/constants/services';
import { BillData } from '@/constants/steps-to-last-bill';
import { cancel, isCancel, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';

type BillContext = {service:ISupportedServices, data: BillData | null, onRevision: boolean}


export async function chooseBillToPayPrompt(
  availableWebsAndBill: BillContext[],
) {
  const labelStatus = ({service,data,onRevision}: BillContext) => {
    if (onRevision) return picocolors.red(service);
    if (!data) return picocolors.yellow(service)
    if (data.paid) return picocolors.green(service);
    return service;
  };

  const hintStatus = ({data,onRevision}: BillContext) => {
    if (onRevision) return picocolors.red("En revisión")
    if (!data) return 'Ha ocurrido un error al buscar datos de la ultima factura'
    if (data.paid)
      return `Pagado: ${picocolors.underline(data.bill)} - ${picocolors.green(data.expireDate)}`;
    return `Monto a pagar: ${picocolors.underline(data.bill)} - Vencimiento: ${picocolors.yellow(data.expireDate)}`;
  };

  const billAmount = availableWebsAndBill.reduce((prev,curr)=> prev + parseInt(curr.data?.bill ?? "0"), 0)

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
        label: `Todo - Total: ${picocolors.underline(billAmount || "Nada")}`,
        value: 'all',
        hint: billAmount ? 'Paga todas los impuestos y facturas pendientes con los respectivos metodos de pago' : "",
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
