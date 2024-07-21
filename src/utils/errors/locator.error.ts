export class LocatorError extends Error {
	constructor(name: string) {
		super(`No se ha podido encontrar: ${name}`);
		this.name = this.constructor.name;
	}
}
