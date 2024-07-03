import { ISupportedServices, SupportedServices } from "./services";

type T = Record<ISupportedServices,string>

export const ServiceDashboards:T = {
  [SupportedServices.enum.Aysa]: "https://portal.web.aysa.com.ar/index.html",
  [SupportedServices.enum.Telecentro]: "",
  [SupportedServices.enum.Edesur]:""
} as const
