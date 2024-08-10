import { SafeExitMessage } from "@/constants/random";
import { StoredPaymentMethodManager } from "@/schemas/paymentMethod.schema";
import { cancel, confirm, isCancel, text } from "@clack/prompts";
import picocolors from "picocolors";

export async function addPaymentAliasPrompt(alias?: string): Promise<string> {
	const answer = await text({
		message: `Escribe un ${picocolors.bold(picocolors.underline("Alias"))} unico para esta tarjeta.`,
		initialValue: alias ?? "",
		validate: (x) =>
			StoredPaymentMethodManager.getLastSchema().shape.payAlias.safeParse(x)
				.error?.errors[0].message,
	});
	if (isCancel(answer)) {
		cancel(SafeExitMessage);
		process.exit(0);
	}
	const proceed = await confirm({
		message: `¿Estas seguro de llamarla '${picocolors.underline(answer)}'?`,
		active: "SI",
		inactive: "NO",
		initialValue: true,
	});

	if (isCancel(proceed)) {
		cancel(SafeExitMessage);
		process.exit(0);
	}
	if (proceed) return answer;
	return await addPaymentAliasPrompt(alias);
}
