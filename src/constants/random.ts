import { ServiceLoginFieldsManager } from "@/schemas/serviceLoginField.schema";

export const generatedFileName = "info.json" as const;

export const SafeExitMessage = "Se ha cancelado la operación.";

export const RequiredServiceFieldAmount = Object.keys(
	ServiceLoginFieldsManager.getLastSchema().shape,
).length;

export const ContextRouteURLs = {
	PROD: "**/*.{png,jpg,jpeg,svg,gif,woff,ico,icon,css}",
	DEV: "**/*.{png,jpg,jpeg,svg,gif,woff,ico,icon}",
} as const;
