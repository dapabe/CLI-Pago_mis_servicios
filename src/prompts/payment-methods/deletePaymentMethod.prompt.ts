import { SafeExitMessage } from '@/constants/random';
import { IStoredPaymentMethod } from '@/schemas/paymentMethod.schema';
import { conjunctionList } from '@/utils/random';
import { cancel, confirm, isCancel, multiselect } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';

type Refs = Required<Pick<IStoredPaymentMethod,"uuid"|"payAlias">>

export async function deletePaymentMethodPrompt(
  aliases: Refs[],
): Promise<string[] | null> {
  const answer = await multiselect({
    message: `Elige cual quieres eliminar - ${picocolors.blue('Presiona <espacio> para alternar selección y <enter> para confirmar/salir')}`,
    cursorAt: aliases[0].uuid,
    required: false,
    options: aliases.map((x) => ({
        label: x.payAlias,
        value: x.uuid,
      })),
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }

  if (!answer.length) return null;
  const displayList = aliases.filter(x=> answer.includes(x.uuid))
  const reafirm = await confirm({
    message: `¿Seguro deseas eliminar ${conjunctionList(displayList.map(x=>picocolors.underline(x.payAlias)))}?`,
    active: 'NO',
    inactive: 'SI',
    initialValue: true,
  });

  if (isCancel(reafirm)) {
    cancel(SafeExitMessage);
    exit(0);
  }

  if (!reafirm) return answer;
  return await deletePaymentMethodPrompt(aliases);
}
