import { IServiceStatus } from "#/types/api";
import { type ISupportedServices, SupportedServices } from "./services";

/**
 *  Temporally disabled services due to changes or problems with the \
 *  companies that hold said service.
 *
 *
 *  In the future this will be fetched from an API.
 *
 *  @description `true` means disabled.
 */
export const ServiceOnRevision: IServiceStatus = {
	[SupportedServices.enum.Aysa]: true,
	[SupportedServices.enum.Edesur]: false,
	[SupportedServices.enum.Telecentro]: false,
} as const;