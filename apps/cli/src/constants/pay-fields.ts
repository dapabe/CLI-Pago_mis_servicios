import type { IStoredPaymentMethod } from "#/schemas/paymentMethod.schema";
import { type ISupportedServices, SupportedServices } from "./services";

type CardFields = Omit<IStoredPaymentMethod, "uuid" | "payAlias">;

type CardFieldsSelectors = Omit<CardFields, "cardBrand" | "cardType"> &
	Partial<Pick<CardFields, "cardBrand" | "cardType">> & {
		submit: string;
	};

/**
 *  Selectors for pay fields
 */
export const PayFields: Record<ISupportedServices, CardFieldsSelectors> = {
	[SupportedServices.enum.Telecentro]: {
		fullName: "#cardHolderName",
		frontNumber: "#cardNumber",
		expireDate: "#cardExpiration",
		backNumber: "#securityCode",
		submit: "button[type=submit]",
	},
	[SupportedServices.enum.Edesur]: {
		fullName: "#cardHolderName",
		frontNumber: "#cardNumber",
		expireDate: "#cardExpiration",
		backNumber: "#securityCode",
		submit: "button[type=submit]",
	},
	[SupportedServices.enum.Aysa]: {
		fullName: "",
		frontNumber: "",
		expireDate: "",
		backNumber: "",
		submit: "",
	},
} as const;
