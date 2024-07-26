import {
	type IValidVersions,
	type SchemaUtilities,
	ZodSchemaManager,
} from "@/utils/ZodSchemaManager";
import { z } from "zod";
import { StoredPaymentMethodManager } from "./paymentMethod.schema";

/**
 * Generic login fields to services.
 */
export class ServiceLoginFieldsSchema
	extends ZodSchemaManager<"0.0.0", typeof ServiceLoginFieldsSchema>
	implements SchemaUtilities
{
	static "0.0.0" = z.object({
		username: z.string().nullable().default(null),
		password: z.string().nullable().default(null),
		aliasRef: StoredPaymentMethodManager.getLastSchema()
			.pick({ uuid: true })
			.shape.uuid.nullable()
			.default(null),
	});

	constructor() {
		super(ServiceLoginFieldsSchema);
	}

	getLastSchema() {
		return ServiceLoginFieldsSchema[this.getLastVersion()];
	}
}

export const ServiceLoginFieldsManager = new ServiceLoginFieldsSchema();

type T = typeof ServiceLoginFieldsSchema;

export type IServiceLoginFields<V extends IValidVersions<T> = "0.0.0"> =
	z.TypeOf<T[V]>;
