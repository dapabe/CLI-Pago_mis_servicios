import {
	type IValidVersions,
	type SchemaUtilities,
	ZodSchemaManager,
} from "@/utils/ZodSchemaManager.js";
import { z } from "zod";
import { StoredPaymentMethodManager } from "./paymentMethod.schema.js";
import { UserServiceManager } from "./userServiceField.schema.js";
import { FlagConfigManager } from "./flags.schema.js";

type LastV = "0.0.0"

/**
 * User sensitive information.
 */
class UserDataSchema
	extends ZodSchemaManager<typeof UserDataSchema, LastV>
	implements SchemaUtilities {

	static "0.0.0" = z.object({
		flags: FlagConfigManager.getLastSchema(),
		serviceFields: UserServiceManager.getLastSchema().default({}),
		paymentMethods: StoredPaymentMethodManager.getLastSchema()
			.optional()
			.array()
			.default([]),
	});

	constructor() {
		super(UserDataSchema, "0.0.0")
	}

	getLastSchema() {
		return UserDataSchema[this.getLastVersion()];
	}
}

export const UserDataManager = new UserDataSchema();

export type IUserData<V extends IValidVersions<typeof UserDataSchema> = LastV> = z.TypeOf<typeof UserDataSchema[V]>;
