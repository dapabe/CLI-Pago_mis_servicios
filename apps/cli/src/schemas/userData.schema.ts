import {
	type IValidVersions,
	type SchemaUtilities,
	ZodSchemaManager,
} from "#/utils/ZodSchemaManager.js";
import { z } from "zod";
import { StoredPaymentMethodManager } from "./paymentMethod.schema.js";
import { UserServiceManager } from "./userServiceField.schema.js";

/**
 * User sensitive information.
 */
export class UserDataSchema
	extends ZodSchemaManager<"0.0.0", typeof UserDataSchema>
	implements SchemaUtilities {
	static "0.0.0" = z.object({
		secureMode: z.boolean().default(true),
		serviceFields: UserServiceManager.getLastSchema().default({}),
		paymentMethods: StoredPaymentMethodManager.getLastSchema()
			.optional()
			.array()
			.default([]),
	});

	constructor() {
		super(UserDataSchema);
	}

	getLastSchema() {
		return UserDataSchema[this.getLastVersion()];
	}
}

export const UserDataManager = new UserDataSchema();

type T = typeof UserDataSchema;

export type IUserData<V extends IValidVersions<T> = "0.0.0"> = z.TypeOf<T[V]>;
