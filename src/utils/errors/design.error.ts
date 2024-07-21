export class DesignError extends Error {
	constructor() {
		super("Ha cambiado el diseño de la página.");
		this.name = this.constructor.name;
	}
}
