import { type ISupportedServices, SupportedServices } from "./services";


export const ServicePages: Record<ISupportedServices, string> = {
	[SupportedServices.enum.Aysa]:
		"https://oficinavirtual.web.aysa.com.ar/index.html",
	[SupportedServices.enum.Edesur]: "https://ov.edesur.com.ar/login",
	[SupportedServices.enum.Telecentro]:
		"https://telecentro.com.ar/sucursal-virtual/login",
} as const;
