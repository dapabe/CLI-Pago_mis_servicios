import type e from "express";
import { Router } from "express";
import type { IRoutePath } from "../types/route";
import type { Controller } from "./controller.abs";

/**
 *  Base route layer to access and trigger \
 *  controller methods.
 */
export abstract class Route {
	public ROUTER: Router;
	public BASE_ROUTE_NAME!: IRoutePath;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	#CONTROLLER: any;

	constructor(controller: typeof Controller) {
		this.#CONTROLLER = controller;
		this.ROUTER = Router();
	}

	/**
	 * Passing down the method to controller.
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	protected handler(action: () => void): any {
		return (req: e.Request, res: e.Response, next: e.NextFunction) =>
			action.call(new this.#CONTROLLER(req, res, next));
	}
}
