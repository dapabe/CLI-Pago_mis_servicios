import { CustomExpressError } from "#/common/errors/CustomExpress.error";
import type e from "express";


/**
 *  Beware of the prototype chain when comparing with `instanceof`
 * 
 */
export const GlobalErrorMiddleware = (
  err: unknown,
  _: e.Request,
  res: e.Response,
  _2: e.NextFunction,
) => {

  if (err instanceof CustomExpressError) {
    return res.status(err.status).json({ error: err.statusText, details: err.details })
  }

  console.error(err);
  return res.status(501).json({ error: "Unknown error" });
};
