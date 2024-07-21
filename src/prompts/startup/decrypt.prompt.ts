import { SafeExitMessage, generatedFileName } from "@/constants/random.js";
import type { IEncryptedData } from "@/schemas/encryptedData.schema";
import { type IUserData, UserDataManager } from "@/schemas/userData.schema";
import { decryptData, encryptData } from "@/utils/crypto.js";
import { cancel, isCancel, password } from "@clack/prompts";
import pkg from "package.json";
import { exit } from "process";

export async function decryptPrompt(
	encryptedData: IEncryptedData,
	filePath: string,
	attempt = 0,
): Promise<{ password: string; userData: IUserData }> {
	const labelStatus = () => {
		if (attempt >= 3)
			return `Si no recuerdas tu contraseña tendras que borrar '${generatedFileName}' y dejar que el programa cree el archivo.`;
		if (attempt) return "Las contraseñas no coinciden, intentalo de nuevo.";
		return "Escribe tu contraseña para desbloquear tus datos encriptados.";
	};
	const answer = await password({
		message: labelStatus(),
		mask: "",
	});
	if (isCancel(answer)) {
		cancel(SafeExitMessage);
		exit(0);
	}

	const decryptedData = decryptData(answer, encryptedData);
	if (!decryptedData)
		return await decryptPrompt(encryptedData, filePath, ++attempt);

	const parsedData = UserDataManager.migrate(
		decryptedData,
		encryptedData.version as any,
		pkg.version as any,
	);

	if (encryptedData.version !== pkg.version) {
		await fs.writeFile(
			filePath,
			JSON.stringify(encryptData(answer, parsedData.data!)),
			"utf-8",
		);
	}

	if (!parsedData.success) {
		cancel(
			`La estructura de datos almacenada no es correcta, esto puede haber pasado \nsi es manipulado de otra forma que no sea con esta herramienta. \n${JSON.stringify(parsedData.error, null, 2)}`,
		);
		return exit(0);
	}

	return {
		password: answer,
		userData: parsedData.data,
	};
}
