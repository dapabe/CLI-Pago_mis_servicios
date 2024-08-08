import { AppPackage } from "@/constants/random";
import picocolors from "picocolors";
import { BaseError } from "./base.error";

export class ApiError extends BaseError {
	constructor(statusCode: number, statusText: string) {
		super();
		this.message = `${statusCode} - ${statusText} | Contacte a quien corresponda en ${picocolors.underline(AppPackage.repository.url)}`;
	}
}
