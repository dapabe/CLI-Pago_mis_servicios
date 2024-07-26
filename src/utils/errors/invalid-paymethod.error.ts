import { BaseError } from "./base.error";

export class InvalidPayMethodError extends BaseError {
	constructor() {
		super();
		this.message = "Las credenciales de pago no son correctas o ha habido un error con el servicio."
	}
}
