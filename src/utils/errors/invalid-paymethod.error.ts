export class InvalidPayMethodError extends Error {
	constructor() {
		super(
			"Las credenciales de pago no son correctas o ha habido un error con el servicio.",
		);
		this.name = this.constructor.name;
	}
}
