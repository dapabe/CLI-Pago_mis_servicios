import { SafeExitMessage } from '@/constants/random';
import { cancel, isCancel, password } from '@clack/prompts';
import { exit } from 'process';

export async function changePasswordPrompt(
  userPass: string,
  isEqual = false,
): Promise<string> {
  const answer = await password({
    message: isEqual
      ? 'Tu nueva contraseña es identica a la actual, elije otra.'
      : 'Escribe tu nueva contraseña',
    mask: '@@',
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }

  if (answer === userPass) return await changePasswordPrompt(userPass, true);
  return answer;
}
