import { BaseError } from "./base.error";

export class DesignError extends BaseError {
	constructor() {
		super()
		this.message = "Ha cambiado el diseño de la página."
	}
}
