import { ISupportedServices, SupportedServices } from "./services";

type T = Record<ISupportedServices,string>

export const ServiceDashboards:T = {
  [SupportedServices.enum.Aysa]: "https://portal.web.aysa.com.ar/index.html",
  [SupportedServices.enum.Telecentro]: "https://telecentro.com.ar/sucursal-virtual/home",
  [SupportedServices.enum.Edesur]:"https://ov.edesur.com.ar/mi-cuenta"
} as const
