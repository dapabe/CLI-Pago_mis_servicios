import { SafeExitMessage } from '@/constants/random';
import { conjunctionList } from '@/utils/random';
import { cancel, confirm, isCancel, multiselect } from '@clack/prompts';
import picocolors from 'picocolors';
import { exit } from 'process';

export async function deletePaymentMethodPrompt(
  aliases: string[],
): Promise<string[] | null> {
  const answer = await multiselect({
    message: `Elige cual quieres eliminar - ${picocolors.blue('Presiona <espacio> para seleccionar y <enter> para confirmar.')}`,
    cursorAt: aliases[0],
    required: false,
    options: [
      ...aliases.map((x) => ({
        label: x,
        value: x,
      })),
    ],
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }

  if (!answer.length) return null;

  const reafirm = await confirm({
    message: `¿Seguro deseas eliminar ${picocolors.underline(conjunctionList(answer))}?`,
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
