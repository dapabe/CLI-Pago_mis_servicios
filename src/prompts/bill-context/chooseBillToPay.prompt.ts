import { SafeExitMessage } from '@/constants/random.js';
import { ISupportedServices } from '@/constants/services';
import { IBillContext } from '@/types/generic';
import { currencyFormat } from '@/utils/random';
import { cancel, isCancel, select } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';



export async function chooseBillToPayPrompt(
  currentBills: IBillContext[],
  filteredBills: IBillContext[]
) {
  const labelStatus = ({service,data,onRevision}: IBillContext) => {
    if (onRevision) return picocolors.red(service);
    if (!data) return picocolors.yellow(service)
    if (data.paid) return picocolors.green(service);
    return service;
  };

  const hintStatus = ({data,onRevision}: IBillContext) => {
    if (onRevision) return picocolors.red("En revisión")
    if (!data) return 'Ha ocurrido un error al buscar datos de la ultima factura'
    if (data.paid)
      return `Pagado: ${picocolors.underline(currencyFormat(data.bill))} - ${picocolors.green(data.expireDate)}`;
    return `Monto a pagar: ${picocolors.underline(currencyFormat(data.bill))} - Vencimiento: ${picocolors.yellow(data.expireDate)}`;
  };

  const billAmount = currencyFormat(
    filteredBills
    .reduce((prev,curr)=> prev + parseFloat(curr.data?.bill.toString() ?? "0"), 0)
  )

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
      ...currentBills.map((ctx) => ({
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
