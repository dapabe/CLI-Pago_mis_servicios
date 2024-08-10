import picocolors from "picocolors";
import { BaseError } from "./base.error";
import pkg from "package.json";
export class ApiError extends BaseError {
	constructor(statusCode: number, statusText: string) {
		super();
		this.message = `${statusCode} - ${statusText} | Contacte a quien corresponda en ${picocolors.underline(pkg.repository.url)}`;
	}
}
