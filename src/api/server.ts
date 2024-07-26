import { IServiceDataKeys, IServicesDashboards, IServicesLastBillPages, IServicesLastBillSelectors, IServicesLoginPages, IServicesLoginSelectors, IServicesStatuses } from "@/types/api"
import { SequenceUtilities } from "@/utils/SequenceUtilities"
import mspack from "@msgpack/msgpack"

const headers = new Headers()
// headers.set("Content-Type", "application/octet-stream")

type ApiRes<T> = { key: IServiceDataKeys, data: T | null }

const API = <T>(key: IServiceDataKeys, nextURL: string): Promise<ApiRes<T>> => fetch(`${process.env.SERVICE_ENDPOINT}/${nextURL}`)
  .then(async x => {
    if (!x.ok || x.status !== 200) return { key, data: null }
    const data = mspack.decode(new Uint8Array(await x.arrayBuffer())) as T
    return { key, data }
  }).catch(x => {
    SequenceUtilities.DEBUG_MODE && console.log(x)
    return { key, data: null }
  })

export const ServerEndpoint = {
  getServicesOnRevision: () => API<IServicesStatuses>("statuses", "services/statuses"),
  getServicesLoginPages: () => API<IServicesLoginPages>("login-url", "services/login-url"),
  getServicesLoginSelectors: () => API<IServicesLoginSelectors>("login-selectors", "services/login-selectors"),
  getServicesDashboardPages: () => API<IServicesDashboards>("dashboard-url", "services/dashboards-url"),
  getServicesLastBillPages: () => API<IServicesLastBillPages>("last-bill-url", "services/last-bill-pages"),
  getServicesLastBillSelectors: () => API<IServicesLastBillSelectors>("last-bill-selectors", "services/last-bill-selectors")
}