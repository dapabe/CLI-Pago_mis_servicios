import { BaseError } from "./base.error";

export class LocatorError extends BaseError {
	constructor(name: string) {
		super();
		this.message = `No se ha podido encontrar: ${name}`
	}
}
