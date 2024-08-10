import { SafeExitMessage } from "@/constants/random";
import { cancel, isCancel, password } from "@clack/prompts";

export async function firstTimePrompt(): Promise<string> {
	const a = await password({
		message:
			"Crea una contraseña con la que podras acceder a tu datos personales, guardala bien.",
		mask: "",
	});
	if (isCancel(a)) {
		cancel(SafeExitMessage);
		process.exit(0);
	}
	return a;
}
