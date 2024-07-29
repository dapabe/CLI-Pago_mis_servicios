import { SafeExitMessage } from "#/constants/random.js";
import type { ISupportedServices } from "#/constants/services";
import type { IServiceLoginFields } from "#/schemas/serviceLoginField.schema";
import type { IUserData } from "#/schemas/userData.schema";
import { TranslatedInput } from "#/utils/translation";
import { cancel, isCancel, select } from "@clack/prompts";
import picocolors from "picocolors";
import { exit } from "process";

export async function chooseServiceLoginFieldPrompt(
	userData: IUserData,
	service: ISupportedServices,
	initField?: keyof IServiceLoginFields,
) {
	const noPayMethods = !userData.paymentMethods.length;

	const labelStatus = (
		field: keyof IServiceLoginFields,
		value: string | null,
	) => {
		if (field === "aliasRef") {
			if (noPayMethods) return picocolors.red(TranslatedInput[field]);
			return value
				? picocolors.green(TranslatedInput[field])
				: TranslatedInput[field];
		}
		return value
			? picocolors.green(TranslatedInput[field])
			: TranslatedInput[field];
	};

	const hintStatus = (
		field: keyof IServiceLoginFields,
		value: string | null,
	) => {
		if (field === "aliasRef") {
			if (noPayMethods)
				return picocolors.yellow("Debes añadir un metodo de pago primero.");
			const payAlias = userData.paymentMethods.find(
				(x) => x?.uuid === value,
			)?.payAlias;
			return payAlias ?? "";
		}
		return userData.secureMode ? "" : value ?? "";
	};

	const answer = await select<any, "exit" | keyof IServiceLoginFields>({
		message: `Editando usuario de '${picocolors.underline(service)}'`,
		initialValue: initField,
		options: [
			{ label: "Volver", value: "exit" },
			...Object.entries(userData.serviceFields[service]!).map(
				([field, value]) => ({
					label: labelStatus(field as keyof IServiceLoginFields, value),
					value: field,
					hint: hintStatus(field as keyof IServiceLoginFields, value),
				}),
			),
		],
	});

	if (isCancel(answer)) {
		cancel(SafeExitMessage);
		exit(0);
	}

	if (noPayMethods && answer === "aliasRef")
		return await chooseServiceLoginFieldPrompt(userData, service, answer);
	return answer;
}