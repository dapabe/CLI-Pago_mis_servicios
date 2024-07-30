import type { IExpressParams } from "#/common/types/random";
import type { z } from "zod";

export const BodyValidator =
  (zodType: z.ZodFirstPartySchemaTypes): IExpressParams =>
    (req, res, next) => {
      const zRes = zodType.safeParse(req.body);
      if (zRes.error) {
        const errs = zRes.error.errors.map((x) => ({ [x.path[1]]: x.message }));
        return res.status(400).send({ error: errs });
      }
      req.body = zRes.data;
      next();
    };
