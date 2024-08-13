import { CardBrand, CardType } from "@/constants/card";
import {
	type IValidVersions,
	type SchemaUtilities,
	ZodSchemaManager,
} from "@/utils/ZodSchemaManager";
import { TranslatedInput } from "@/utils/translation";
import { z } from "zod";

type LastV = "0.0.0"

class StoredPaymentMethodSchema
	extends ZodSchemaManager<typeof StoredPaymentMethodSchema, LastV>
	implements SchemaUtilities {

	static "0.0.0" = z.object({
		fullName: z.string().trim().min(1, "El nombre no puede estar vacio."),
		frontNumber: z.string().refine((val) => /^\d{14,16}$/.test(val), {
			message: `${TranslatedInput.frontNumber} tiene que ser un digito entre 14-16.`,
		}),
		expireDate: z
			.string()
			.refine((val) => /^(0[1-9]|1[0-2])\/\d{2,4}$/.test(val), {
				message: `${TranslatedInput.expireDate} debe estar formato MM/YY o MM/YYYY.`,
			}),
		backNumber: z.string().refine((val) => /^\d{3,4}$/.test(val), {
			message: `${TranslatedInput.backNumber} tiene que ser un numero de 3-4 digitos.`,
		}),
		cardType: CardType.default("Débito"),
		cardBrand: CardBrand.nullable().default(null),
		payAlias: z.string().trim().min(1, "El Alias no puede estar vacio."),
		uuid: z.string().uuid().default(crypto.randomUUID()),
	});

	constructor() {
		super(StoredPaymentMethodSchema, "0.0.0")
	}

	getLastSchema() {
		return StoredPaymentMethodSchema[this.getLastVersion()];
	}
}

export const StoredPaymentMethodManager = new StoredPaymentMethodSchema();

/**
 * Credit/debit card data structure.
 */
export type IStoredPaymentMethod<V extends IValidVersions<typeof StoredPaymentMethodSchema> = LastV> =
	z.TypeOf<typeof StoredPaymentMethodSchema[V]>;
