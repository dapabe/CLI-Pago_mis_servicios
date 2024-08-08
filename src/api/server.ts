import type { IServiceDataKeys, IServicesStatuses } from "@/types/api";
import { SequenceUtilities } from "@/utils/SequenceUtilities";
import { ApiError } from "@/utils/errors/API.error";
import type { BaseError } from "@/utils/errors/base.error";
import { log } from "@clack/prompts";
import mspack from "@msgpack/msgpack";

type ResError = {
	reason: string;
};
type ApiRes<T> =
	| { key: IServiceDataKeys; data: T }
	| { key: IServiceDataKeys; data: null; error: ResError };

const API = <T>(key: IServiceDataKeys, nextURL: string): Promise<ApiRes<T>> =>
	fetch(`${SequenceUtilities.ENV.backend_endpoint}/api/v1/${nextURL}`)
		.then(async (res) => {
			const statusBad = [500, 404].some((x) => x === res.status);
			if (!res.ok || statusBad) throw new ApiError(res.status, res.statusText);
			const data = mspack.decode(new Uint8Array(await res.arrayBuffer())) as T;
			return { key, data };
		})
		.catch((x: BaseError) => {
			const temp: ApiRes<T> = {
				key,
				data: null,
				error: { reason: "Error desconocido" },
			};

			if (x.name === ApiError.name) {
				temp.error.reason = x.message;
				return temp;
			}

			log.error(`${key}: ${x.message} - ${x.cause}`);

			return temp;
		});

export const ServerEndpoint = {
	getServicesOnRevision: () =>
		API<IServicesStatuses>("statuses", "services/statuses"),
	// getServicesLoginPages: () =>
	// 	API<IServicesLoginPages>("login-url", "services/login-url"),
	// getServicesLoginSelectors: () => API<IServicesLoginSelectors>("login-selectors", "services/login-selectors"),
	// getServicesDashboardPages: () => API<IServicesDashboards>("dashboard-url", "services/dashboards-url"),
	// getServicesLastBillPages: () => API<IServicesLastBillPages>("last-bill-url", "services/last-bill-pages"),
	// getServicesLastBillSelectors: () => API<IServicesLastBillSelectors>("last-bill-selectors", "services/last-bill-selectors")
};
