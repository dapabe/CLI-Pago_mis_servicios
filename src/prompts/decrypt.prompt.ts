import { SafeExitMessage } from '@/constants/random.js';
import { decryptData } from '@/utils/crypto.js';
import { Logger } from '@/utils/logger.js';
import { cancel, isCancel, password } from '@clack/prompts';
import { exit } from 'process';
import { IEncryptedData } from '../schemas/encryptedData.schema.js';
import { IUserData, UserDataSchema } from '../schemas/userData.schema.js';

export async function decryptPrompt(
  encryptedData: IEncryptedData,
  attempt = 0,
): Promise<{ password: string; userData: IUserData }> {
  try {
    const answer = await password({
      message: attempt
        ? 'Las contraseñas no coinciden, intentalo de nuevo.'
        : 'Escribe tu contraseña para desbloquear tus datos encriptados.',
      mask: '@@',
    });
    if (isCancel(answer)) {
      cancel(SafeExitMessage);
      exit(0);
    }

    const decryptedData = decryptData(answer, encryptedData);
    if (!decryptedData) return await decryptPrompt(encryptedData, ++attempt);

    const parsedData = UserDataSchema.safeParse(decryptedData);
    if (!parsedData.success) {
      Logger.error(`La estructura de datos almacenada no es correcta. \n
        ${JSON.stringify(parsedData.error.flatten().fieldErrors)}`);
      exit(1);
    }

    return {
      password: answer,
      userData: parsedData.data,
    };
  } catch (error) {
    Logger.error(JSON.stringify(error));
    exit(1);
  }
}
