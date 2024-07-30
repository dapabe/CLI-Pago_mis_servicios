import type { IExpressParams } from "#/common/types/random";

export const DevModeMiddleware: IExpressParams = (_, res, next) => {
	if (process.env.NODE_ENV === "production") return res.status(404).send();
	return next();
};
