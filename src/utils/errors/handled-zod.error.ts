import type { ZodError } from "zod";
import { conjunctionList } from "../random";
import { BaseError } from "./base.error";

export class HandledZodError extends BaseError {
	constructor(err: ZodError) {
		super();
		this.message = conjunctionList(
			err.errors.map((x) => `${x.path.join("")}: ${x.message}`),
		);
	}
}
