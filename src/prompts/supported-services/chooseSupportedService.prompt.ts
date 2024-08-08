import { exit } from "node:process";
import {
	RequiredServiceFieldAmount,
	SafeExitMessage,
} from "@/constants/random.js";
import {
	type ISupportedServices,
	SupportedServices,
} from "@/constants/services.js";
import { Sequence } from "@/index.js";
import { ServiceLoginFieldsManager } from "@/schemas/serviceLoginField.schema.js";
import type { IUserData } from "@/schemas/userData.schema.js";
import { cancel, isCancel, select } from "@clack/prompts";
import picocolors from "picocolors";
import { getDefaultsForSchema } from "zod-defaults";
import { chooseServiceLoginFieldPrompt } from "./chooseServiceLoginField.prompt.js";
import { editSupportedServiceField } from "./editSupportedServiceField.prompt.js";

export async function chooseSupportedServicePrompt(userData: IUserData) {
	const completedFields = (service: ISupportedServices): number => {
		return !userData.serviceFields[service]
			? 0
			: Object.values(userData.serviceFields[service]!).filter(Boolean).length;
	};

	const completionStatus = (service: ISupportedServices): string => {
		const noExistence = !userData.serviceFields[service];
		if (Sequence.ServiceData.statuses[service]) return picocolors.red(service);
		if (noExistence) return service;
		if (completedFields(service) === RequiredServiceFieldAmount)
			return picocolors.green(service);
		return picocolors.yellow(service);
	};

	const hintStatus = (service: ISupportedServices) => {
		if (Sequence.ServiceData.statuses[service])
			return picocolors.red("En revisión");
		if (!userData.serviceFields[service]) return "";
		return `${completedFields(service)}/${RequiredServiceFieldAmount} campos completados`;
	};

	const chosenService = await select<any, "exit" | ISupportedServices>({
		message: "¿Que servicio editaras?",
		initialValue: "exit",
		options: [
			{
				label: "Volver",
				value: "exit",
			},
			...Object.values(SupportedServices.enum).map((service) => ({
				label: completionStatus(service),
				value: service,
				hint: hintStatus(service),
			})),
		],
	});
	if (isCancel(chosenService)) {
		cancel(SafeExitMessage);
		exit(0);
	}

	if (chosenService === "exit") return await Promise.resolve();

	if (Sequence.ServiceData.statuses[chosenService])
		return await chooseSupportedServicePrompt(userData);

	//  In case the field does not exists it has to be created for the next function
	//  or else will crash, because it depends on `chosenService` has properties.
	//  on exit instances just clear the data.
	userData.serviceFields[chosenService] ||= getDefaultsForSchema(
		ServiceLoginFieldsManager.getLastSchema(),
	);

	const serviceFieldData = await chooseServiceLoginFieldPrompt(
		userData,
		chosenService,
	);

	if (serviceFieldData === "exit") {
		clearOnExit(userData);
		return await chooseSupportedServicePrompt(userData);
	}

	const fieldData = await editSupportedServiceField(
		userData,
		serviceFieldData,
		chosenService,
	);
	if (
		fieldData === "exit" ||
		(serviceFieldData === "aliasRef" && !userData.paymentMethods.length)
	) {
		clearOnExit(userData);
		return await chooseSupportedServicePrompt(userData);
	}

	userData.serviceFields[chosenService]![serviceFieldData] = fieldData;
	return await chooseSupportedServicePrompt(userData);
}

function clearOnExit(userData: IUserData) {
	if (!Object.keys(userData.serviceFields).length) {
		userData.serviceFields = {};
	}
}
