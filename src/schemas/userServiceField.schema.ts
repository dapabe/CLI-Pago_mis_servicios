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

type LastV = "0.0.0"

/**
 * User sensitive information data structure.
 */
class UserServiceSchema
	extends ZodSchemaManager<typeof UserServiceSchema, LastV>
	implements SchemaUtilities {
	static "0.0.0" = createDynamicServiceField();

	constructor() {
		super(UserServiceSchema, "0.0.0")
	}

	getLastSchema() {
		return UserServiceSchema[this.getLastVersion()];
	}
}
export const UserServiceManager = new UserServiceSchema()

export type IUserService<V extends IValidVersions<typeof UserServiceSchema> = LastV> = z.TypeOf<
	typeof UserServiceSchema[V]
>;
