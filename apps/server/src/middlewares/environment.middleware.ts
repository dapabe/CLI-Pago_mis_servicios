import { type envSchema, TypedEnv } from "#/common/typed-env";
import type { IExpressParams } from "#/common/types/random";
import type { z } from "zod";

/**
 * 	The route on which this middleware is executed wont proceed \
 * 	unless the `process.env.NODE_ENV` matches the given argument.
 */
export const EnvironmentMiddleware =
	(env: z.TypeOf<typeof envSchema.shape.env>): IExpressParams =>
		(_, res, next) => {
			if (TypedEnv.env === env) return res.status(404).send();
			return next();
		};

