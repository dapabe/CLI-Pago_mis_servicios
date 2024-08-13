import type { IServicesStatuses } from "@/types/api";

export const InjectedData = {
  ServicesStatuses: Bun.env.__SS1 as unknown as IServicesStatuses
}