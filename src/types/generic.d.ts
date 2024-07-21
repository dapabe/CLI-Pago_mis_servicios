import type { ISupportedServices } from "@/constants/services";
import type { BillData } from "@/constants/steps-to-last-bill";
import type { IUserData } from "@/schemas/userData.schema";

export type IPromptAction = "next" | "exit";
export type IEditAction = keyof IUserData;

export type IAvailableBill = {
	service: ISupportedServices;
	data: BillData | null;
};
export type IBillContext = IAvailableBill & { onRevision: boolean };
