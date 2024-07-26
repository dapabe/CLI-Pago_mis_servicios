import { z } from "zod";

export const CardType = z.enum([
	"Crédito",
	"Débito",
	"Prepagada",
	"Regalo",
	"Fidelidad",
	"Viaje",
	"Corporativa",
]);
export const CardBrand = z.enum([
	"Visa",
	"Mastercard",
	"Maestro",
	"American Express",
	"Discover",
	"JCB",
	"Diners Club",
	"UnionPay",
]);

export type ICardType = z.TypeOf<typeof CardType>;
export type ICardBrand = z.TypeOf<typeof CardBrand>;
