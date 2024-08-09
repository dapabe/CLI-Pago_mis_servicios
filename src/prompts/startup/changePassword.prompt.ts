import { exit } from "node:process";
import { SafeExitMessage } from "@/constants/random";
import { cancel, isCancel, password } from "@clack/prompts";

export async function changePasswordPrompt(userPass: string): Promise<string> {
	const answer = await password({
		message: "Escribe tu nueva contraseña",
		mask: "",
		validate: (value) =>
			value === userPass
				? "Tu nueva contraseña es identica a la actual, elije otra."
				: "",
	});
	if (isCancel(answer)) {
		cancel(SafeExitMessage);
		exit(0);
	}
	return answer;
}
