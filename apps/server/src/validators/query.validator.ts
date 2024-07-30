import type { IExpressParams } from "#/common/types/random";
import { z } from "zod";

/**
 *  Define default query params for the route
 */
export const QueryValidator =
	(queryShape: z.ZodRawShape): IExpressParams =>
		(req, res, next) => {
			const zRes = z.object(queryShape).safeParse(req.query);
			if (zRes.error) {
				const errs = zRes.error.errors.map((x) => ({ [x.path[0]]: x.message }));
				res.status(501).send({ params: errs });
			} else {
				for (const [param, zodType] of Object.entries(queryShape)) {
					if (zodType.isOptional() && !req.query[param]) req.query[param] = "";
				}
				next();
			}
		};
