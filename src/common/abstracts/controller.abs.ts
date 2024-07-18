import { App } from "#/App";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type express from "express";

/**
 *  Base Controller to acces and manipulate Supabase \
 *  data.
 */
export abstract class Controller {
	public req: express.Request;
	public res: express.Response;
	protected CONN = App.SUPA;

	constructor(req: express.Request, res: express.Response) {
		this.req = req;
		this.res = res;
	}

	protected async handleSupaError<T>(res: PostgrestSingleResponse<T>) {
		if (res.error) {
			return this.res.status(res.status).send({ error: res.statusText, message: res.error.message });
		}
	}
}
