import {
	type IValidVersions,
	type SchemaUtilities,
	ZodSchemaManager,
} from "@/utils/ZodSchemaManager";
import { z } from "zod";
import { StoredPaymentMethodManager } from "./paymentMethod.schema";

type LastV = "0.0.0"

/**
 * Generic login fields to services.
 */
class ServiceLoginFieldsSchema
	extends ZodSchemaManager<typeof ServiceLoginFieldsSchema, LastV>
	implements SchemaUtilities {

	static "0.0.0" = z.object({
		username: z.string().nullable().default(null),
		password: z.string().nullable().default(null),
		aliasRef: StoredPaymentMethodManager.getLastSchema()
			.pick({ uuid: true })
			.shape.uuid.nullable()
			.default(null),
	});

	constructor() {
		super(ServiceLoginFieldsSchema, "0.0.0")
	}

	getLastSchema() {
		return ServiceLoginFieldsSchema[this.getLastVersion()];
	}
}

export const ServiceLoginFieldsManager = new ServiceLoginFieldsSchema();

export type IServiceLoginFields<V extends IValidVersions<typeof ServiceLoginFieldsSchema> = LastV> =
	z.TypeOf<typeof ServiceLoginFieldsSchema[V]>;
