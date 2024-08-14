import { SafeExitMessage } from "@/constants/random";
import type { IUserData } from "@/schemas/userData.schema";
import type { IFlagConfigOption, IPromptAction } from "@/types/generic";
import { cancel, isCancel, select } from "@clack/prompts";
import picocolors from "picocolors";

export async function flagsPrompt(userData: IUserData, initialValue: Extract<IPromptAction, "exit"> | IFlagConfigOption = "exit") {
  const answer = await select<any, Extract<IPromptAction, "exit"> | IFlagConfigOption>({
    message: "Configuración",
    initialValue,
    options: [
      {
        label: "Volver",
        value: "exit",
      },
      {
        label: `Modo seguro: ${userData.flags.secure ? picocolors.green("Activado") : `${picocolors.red("Desactivado")} - ${picocolors.yellow("[Ten cuidado a quien muestras tus datos]")}`}`,
        value: "secure",
        hint: "Oculta o no el valor de los campos con información sensible",
      },
      {
        label: `Navegador activado: ${!userData.flags.headless ? picocolors.green("Activado") : `${picocolors.red("Desactivado")}`}`,
        value: "headless",
        hint: `Abre el navegador interno y muestra los pasos internamente - ${picocolors.yellow("[Es recomendable que no se toque nada]")}`,
      },
    ],
  });

  if (isCancel(answer)) {
    cancel(SafeExitMessage);
    process.exit(0);
  }
  if (answer === "exit") return await Promise.resolve()

  userData.flags[answer] = !userData.flags[answer]

  await flagsPrompt(userData, answer)
}
