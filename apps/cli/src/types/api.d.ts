import { ISupportedServices } from "#/constants/services";
import { BillData } from "#/constants/steps-to-last-bill";

/**
 *  Endpoint data key
 */
export type IServiceDataKeys =
  | "statuses"
  | "login-url"
  | "login-selectors"
  | "dashboard-url"
  | "last-bill-url"
  | "last-bill-selectors"

/**
 *  Global api state
 */
export type IServiceData = {
  "statuses": IServicesStatuses;
  "login-url": IServicesLoginPages;
  "login-selectors": IServicesLoginSelectors;
  "dashboard-url": IServicesDashboards;
  "last-bill-url": IServicesLastBillPages;
  "last-bill-selectors": IServicesLastBillSelectors;
}


/**
 *  Wheter a service is "ok" to operate on..
 */
export type IServicesStatuses = Record<ISupportedServices, boolean>

/**
 *  It wouldnt be an issue since login fields rarely get modified,
 *  but just in case this will also come from the API.
 */
export type IServicesLoginSelectors = Record<ISupportedServices, string>

/**
 * 	Some pages will have to enter from another place \
 *  if this is the case then procced with `StepsToLogin` \
 * 	but in first place must be setted to `login` page.
 */
export type IServicesLoginPages = IServicesLoginSelectors

/**
 *  The navigator is expected to be in this URL to begin with.
 */
export type IServicesDashboards = IServicesLoginSelectors

/**
 *  Some bill pages dont need this, in that case just procced \
 *  to `IServicesLastBillSelectors`.
 */
export type IServicesLastBillPages = Partial<IServicesLoginSelectors>

/**
 *  Relevant service information selectors.
 */
export type IServicesLastBillSelectors = Record<ISupportedServices, Record<keyof BillData, string>>