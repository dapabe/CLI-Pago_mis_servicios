import type e from "express";
import { Router } from "express";
import type { IRoutePath } from "../types/route";
import type { Controller } from "./controller.abs";
import { IExpressParams } from "../types/random";

/**
 *  Base route layer to access and trigger controller \
 * 	methods.
 */
export abstract class Route {
	public ROUTER: Router;
	public BASE_ROUTE_NAME!: IRoutePath;
	#CONTROLLER: Controller;

	constructor(con: typeof Controller) {
		this.#CONTROLLER = new con({} as e.Request, {} as e.Response, {} as e.NextFunction);
		this.ROUTER = Router();
	}

	/**
	 * Passing down the method to the controller *`singleton`*
	 */
	protected handler(action: Function): IExpressParams {
		return (...requestHandlers) =>
			action.call(this.#CONTROLLER.constructor(...requestHandlers));
	}
}
