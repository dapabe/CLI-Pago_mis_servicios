import { SafeExitMessage } from "@/constants/random";
import {
	type IStoredPaymentMethod,
	StoredPaymentMethodManager,
} from "@/schemas/paymentMethod.schema";

import { CardBrand, CardType } from "@/constants/card";
import type { ISupportedServices } from "@/constants/services";
import type { IUserData } from "@/schemas/userData.schema";
import * as prompt from "@clack/prompts";
import { exit } from "process";
import { addPaymentAliasPrompt } from "./addPaymentAlias.prompt";

export async function addPaymentMethodPrompt(
	userData: IUserData,
	payMethod?: Partial<IStoredPaymentMethod>,
): Promise<void> {
	const group = await prompt.group(
		{
			cardType: () =>
				prompt.select({
					message: "Tipo de tarjeta",
					initialValue:
						payMethod?.cardType ??
						StoredPaymentMethodManager.getLastSchema().shape.cardType._def.defaultValue(),
					options: Object.values(CardType.enum).map((x) => ({
						label: x,
						value: x,
					})),
				}),
			cardBrand: () =>
				prompt.select({
					message: "Marca de tarjeta (Opcional)",
					initialValue: payMethod?.cardBrand ?? null,
					options: [
						{
							label: "Ninguno/a",
							value: null,
						},
						...Object.values(CardBrand.enum).map((x) => ({
							label: x,
							value: x,
						})),
					],
				}),
			fullName: () =>
				prompt.text({
					message: "Nombre completo",
					initialValue: payMethod?.fullName ?? "",
					validate: (x) =>
						StoredPaymentMethodManager.getLastSchema().shape.fullName.safeParse(
							x,
						).error?.errors[0].message,
				}),
			frontNumber: () =>
				prompt.text({
					message: "Número de la tarjeta (Sin espacios)",
					placeholder: "0000 0000 0000 0000",
					initialValue: payMethod?.frontNumber ?? "",
					validate: (x) =>
						StoredPaymentMethodManager.getLastSchema().shape.frontNumber.safeParse(
							x,
						).error?.errors[0].message,
				}),
			expireDate: () =>
				prompt.text({
					message: "Fecha de vencimiento",
					placeholder: "01/29",
					initialValue: payMethod?.expireDate ?? "",
					validate: (x) =>
						StoredPaymentMethodManager.getLastSchema().shape.expireDate.safeParse(
							x,
						).error?.errors[0].message,
				}),
			backNumber: () =>
				prompt.text({
					message: "Clave de seguridad (CVV)",
					placeholder: "000",
					initialValue: payMethod?.backNumber ?? "",
					validate: (x) =>
						StoredPaymentMethodManager.getLastSchema().shape.backNumber.safeParse(
							x,
						).error?.errors[0].message,
				}),
		},
		{
			onCancel() {
				prompt.cancel(SafeExitMessage);
				exit(0);
			},
		},
	);

	const payAlias = await addPaymentAliasPrompt(payMethod?.payAlias);
	//  If payMethod exists then is modifying info, else adding info.
	if (payMethod) {
		const toReplace = userData.paymentMethods.find(
			(x) => x!.uuid === payMethod.uuid,
		)!;
		userData.paymentMethods = [
			...userData.paymentMethods.filter((x) => x!.uuid !== payMethod.uuid),
			{ ...toReplace, payAlias },
		];

		//  Execute changes in services
		for (const service of Object.keys(userData.serviceFields)) {
			userData.serviceFields[service as ISupportedServices]!.aliasRef =
				payMethod.uuid!;
		}
	} else {
		userData.paymentMethods.push({
			...group,
			payAlias,
			uuid: crypto.randomUUID(),
		});
	}
}
