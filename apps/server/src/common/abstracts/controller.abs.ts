import type e from "express";
import msgpack from "@msgpack/msgpack";
import { Database } from "#/database/Database";

/**
 *  Base Controller to access and manipulate Supabase \
 *  data.
 * 
 * 	Should be an abstract class but for Singleton purposes \
 * 	and TypeScript it does not.
 * 
 * 	@throws "Cannot instantiate an abstract class"
 */
export class Controller {
	protected req: e.Request;
	protected res: e.Response;
	protected next: e.NextFunction;

	/**
	 * 	Database connection repository
	 */
	protected CONN = Database.CONN;

	constructor(req: e.Request, res: e.Response, next: e.NextFunction) {
		this.req = req;
		this.res = res;
		this.next = next
	}

	protected convertBinary(data: unknown): Buffer {
		const enc = msgpack.encode(data)
		return Buffer.from(enc.buffer, enc.byteOffset, enc.byteLength)
	}

	/**
	 * 	Used to test
	 */
	// protected decodeBinary(buf: Buffer): unknown {
	// 	return msgpack.decode(buf)
	// }
}
