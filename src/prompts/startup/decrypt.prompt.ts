import { SafeExitMessage } from '@/constants/random.js';
import { UserDataSchema } from '@/schemas/userData.schema';
import { IEncryptedData, IUserData } from '@/types/releases.js';
import { decryptData } from '@/utils/crypto.js';
import { cancel, isCancel, log, password } from '@clack/prompts';
import { exit } from 'process';

export async function decryptPrompt(
  encryptedData: IEncryptedData,
  attempt = 0,
): Promise<{ password: string; userData: IUserData }> {
  const answer = await password({
    message: attempt
      ? 'Las contraseñas no coinciden, intentalo de nuevo.'
      : 'Escribe tu contraseña para desbloquear tus datos encriptados.',
    mask: '',
  });
  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    exit(0);
  }

  const decryptedData = decryptData(answer, encryptedData);
  if (!decryptedData) return await decryptPrompt(encryptedData, ++attempt);

  const parsedData = UserDataSchema.getLastSchema().safeParse(decryptedData);

  if (!parsedData.success) {
    console.log(decryptedData);
    log.error(
      `La estructura de datos almacenada no es correcta, esto puede haber pasado \nsi es manipulado de otra forma que no sea con esta herramienta.`,
    );
    cancel(JSON.stringify(parsedData.error.issues.map((x) => x.message)));
    return exit(0);
  }

  return {
    password: answer,
    userData: parsedData.data,
  };
}
