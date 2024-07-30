import type { IAppRoute } from "./common/types/route";
import { ServicesRoute } from "./routes/services.route";

export type VersionedAPI = "/v1";

export const AppRoutes: Record<VersionedAPI, IAppRoute[]> = {
	"/v1": [
		{
			middlewares: [],
			route: new ServicesRoute(),
		},
	],
};
