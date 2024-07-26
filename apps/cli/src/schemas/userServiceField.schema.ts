import {
	type ISupportedServices,
	SupportedServices,
} from "@/constants/services";
import {
	type IValidVersions,
	type SchemaUtilities,
	ZodSchemaManager,
} from "@/utils/ZodSchemaManager";
import { z } from "zod";
import { ServiceLoginFieldsManager } from "./serviceLoginField.schema";

function createDynamicServiceField() {
	const dynamic: Record<
		ISupportedServices,
		z.ZodOptionalType<
			ReturnType<typeof ServiceLoginFieldsManager.getLastSchema>
		>
	> = {} as any;

	for (const service of Object.values(SupportedServices.enum)) {
		dynamic[service] = ServiceLoginFieldsManager.getLastSchema().optional();
	}
	return z.object(dynamic);
}

/**
 * User sensitive information data structure.
 */
export class UserServiceSchema
	extends ZodSchemaManager<"0.0.0", typeof UserServiceSchema>
	implements SchemaUtilities
{
	static "0.0.0" = createDynamicServiceField();

	constructor() {
		super(UserServiceSchema);
	}

	getLastSchema() {
		return UserServiceSchema[this.getLastVersion()];
	}
}
export const UserServiceManager = new UserServiceSchema();

type T = typeof UserServiceSchema;

export type IUserService<V extends IValidVersions<T> = "0.0.0"> = z.TypeOf<
	T[V]
>;
