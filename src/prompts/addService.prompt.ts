import { SupportedServices } from '@/constants/services.js';
import { select } from '@clack/prompts';
import { IUserData } from '../schemas/userData.schema.js';
import { chooseServiceLoginFieldPrompt } from './chooseServiceLoginField.prompt.js';

// Exclude<IPromptAction, "next"> | IServices
export async function addServicePrompt(userData: IUserData) {
  const chosenService = await select({
    message: '¿Que servicio agregar?',
    initialValue: 'exit',
    options: [
      {
        name: 'Volver',
        value: 'exit',
      },
      ...Object.values(SupportedServices).map((x) => ({
        name: x,
        value: x,
      })),
    ],
  });

  if (chosenService === 'exit') return await Promise.resolve();

  userData.serviceFields[chosenService] = {
    username: '',
    password: '',
  };
  console.log(userData.serviceFields[chosenService]);
  const serviceFieldData = await chooseServiceLoginFieldPrompt(
    userData,
    chosenService,
  );
  console.log(userData.serviceFields[chosenService]);

  if (serviceFieldData === 'exit') return await addServicePrompt(userData);

  userData.serviceFields[chosenService]![serviceFieldData] = 'data';
  return await addServicePrompt(userData);
}

// async function modifyFieldData(
//   userData: IUserData,
//   field: keyof Exclude<Required<IServiceLoginFields>, undefined>,
// ) {
//   const translated = field === 'password' ? 'Contraseña' : 'Usuario';
//   const answer = await password({
//     message: `Cambiando valor de '${translated}'. - Presiona <ENTER> sin escribir nada, para rescribirlo vacio.`,
//   });
// }
