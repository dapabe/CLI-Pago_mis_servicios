import type { ISupportedServices } from "#/constants/services";
import type { IServiceLoginFields } from "#/schemas/serviceLoginField.schema";
import type { IUserData } from "#/schemas/userData.schema";
import type { IBillContext } from "#/types/generic";

export function getServicesWithFilledLogins(userData: IUserData) {
	const stripped = (
		Object.entries(userData.serviceFields) as [
			ISupportedServices,
			IServiceLoginFields,
		][]
	).map(([service, { aliasRef, ...fields }]) => ({ service, fields }));
	return stripped.filter((x) => Object.values(x.fields).every(Boolean));
}

export function getServicesWithAllFilledLogins(userData: IUserData) {
	const stripped = (
		Object.entries(userData.serviceFields) as [
			ISupportedServices,
			IServiceLoginFields,
		][]
	).map((x) => ({ service: x[0], fields: x[1] }));
	return stripped.filter((x) => Object.values(x.fields).every(Boolean));
}

export function conjunctionList(s: string[]) {
	return new Intl.ListFormat("es-ES", { type: "conjunction" }).format(s);
}

/**
 *  Only works for PESOS ARGENTINOS
 */
export function currencyFormat(n: number) {
	return new Intl.NumberFormat("es-AR", {
		currency: "ARS",
		style: "currency",
	}).format(n);
}

export function normalizeNumber(n: string) {
	return n
		.replace(/[^\d,.-]/g, "") //  Removes anything not related to a number.
		.replace(/\./g, "") //  Removes dots from thousands
		.replace(/,/, "."); //  Replace comma with dot for float number separator
}

export function sortBills(a: IBillContext, b: IBillContext) {
	if (!a.onRevision && b.onRevision) return -1;
	if (!a.data?.paid && b.data?.paid) return -1;
	return 1;
}
