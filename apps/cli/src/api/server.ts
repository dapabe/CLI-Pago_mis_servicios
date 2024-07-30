import { env } from "#/constants/env"
import { IServiceDataKeys, IServicesDashboards, IServicesLastBillPages, IServicesLastBillSelectors, IServicesLoginPages, IServicesLoginSelectors, IServicesStatuses } from "#/types/api"
import { SequenceUtilities } from "#/utils/SequenceUtilities"
import { log } from "@clack/prompts"
import mspack from "@msgpack/msgpack"

// const headers = new Headers()
// headers.set("Content-Type", "application/octet-stream")

type ApiRes<T> = { key: IServiceDataKeys, data: T } | { key: IServiceDataKeys, data: null, error: string }

const API = <T>(key: IServiceDataKeys, nextURL: string): Promise<ApiRes<T>> => fetch(`${env.backend_endpoint}/${nextURL}`)
  .then(async x => {
    SequenceUtilities.DEBUG_MODE && log.warning(`${key}: ${JSON.stringify(x)}`)
    const noData: ApiRes<T> = { key, data: null, error: "" }
    if (!x.ok) {
      noData["error"] = `not "ok" (${x.statusText})`;
      return noData;
    }
    if (x.status !== 200) {
      noData["error"] = `status ${x.status} (${x.statusText})`;
      return noData
    }
    const data = mspack.decode(new Uint8Array(await x.arrayBuffer())) as T
    return { key, data }
  }).catch(x => {
    return { key, data: null, error: x.message }
  })

export const ServerEndpoint = {
  getServicesOnRevision: () => API<IServicesStatuses>("statuses", "services/statuses"),
  getServicesLoginPages: () => API<IServicesLoginPages>("login-url", "services/login-url"),
  getServicesLoginSelectors: () => API<IServicesLoginSelectors>("login-selectors", "services/login-selectors"),
  getServicesDashboardPages: () => API<IServicesDashboards>("dashboard-url", "services/dashboards-url"),
  getServicesLastBillPages: () => API<IServicesLastBillPages>("last-bill-url", "services/last-bill-pages"),
  getServicesLastBillSelectors: () => API<IServicesLastBillSelectors>("last-bill-selectors", "services/last-bill-selectors")
}