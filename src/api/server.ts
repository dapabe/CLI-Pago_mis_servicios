import type {
	IServiceDataKeys,
	IServicesLoginPages,
	IServicesStatuses,
} from "@/types/api";
import { SequenceUtilities } from "@/utils/SequenceUtilities";
import { note } from "@clack/prompts";
import mspack from "@msgpack/msgpack";
import picocolors from "picocolors";

type ApiRes<T> = { key: IServiceDataKeys; data: T | null };

const API = <T>(key: IServiceDataKeys, nextURL: string): Promise<ApiRes<T>> =>
	fetch(`${SequenceUtilities.ENV.backend_endpoint}/api/v1/${nextURL}`)
		.then(async (x) => {
			if (!x.ok || x.status !== 200) return { key, data: null };
			const data = mspack.decode(new Uint8Array(await x.arrayBuffer())) as T;
			return { key, data };
		})
		.catch((x) => {
			SequenceUtilities.DEBUG_MODE &&
				note(
					`${nextURL}: ${x.message} - ${x.cause}`,
					picocolors.bgYellow("[DEBUG]"),
				);
			return { key, data: null };
		});

export const ServerEndpoint = {
	getServicesOnRevision: () =>
		API<IServicesStatuses>("statuses", "services/statuses"),
	getServicesLoginPages: () =>
		API<IServicesLoginPages>("login-url", "services/login-url"),
	// getServicesLoginSelectors: () => API<IServicesLoginSelectors>("login-selectors", "services/login-selectors"),
	// getServicesDashboardPages: () => API<IServicesDashboards>("dashboard-url", "services/dashboards-url"),
	// getServicesLastBillPages: () => API<IServicesLastBillPages>("last-bill-url", "services/last-bill-pages"),
	// getServicesLastBillSelectors: () => API<IServicesLastBillSelectors>("last-bill-selectors", "services/last-bill-selectors")
};
