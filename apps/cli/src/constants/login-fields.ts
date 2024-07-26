import { type ISupportedServices, SupportedServices } from "./services";

type Opts = {
	username: string;
	password: string;
	submit: string;
};

/**
 * 	This constant has to be changed manually if for some reason \
 * 	the login form changes.
 *
 */
export const LoginFields: Record<ISupportedServices, Opts> = {
	[SupportedServices.enum.Aysa]: {
		username: "#j_username",
		password: "#j_password",
		submit: "#logOnFormSubmit",
	},
	[SupportedServices.enum.Edesur]: {
		username: ".hidden-content-smart-phone input[type=email]",
		password: ".hidden-content-smart-phone input[type=password]",
		submit: ".hidden-content-smart-phone button[type=button]",
	},
	[SupportedServices.enum.Telecentro]: {
		username: "input[type=email]",
		password: "input[type=password]",
		submit: "button[type=submit]",
	},
} as const;
