import { Controller } from "#/common/abstracts/controller.abs";
import { CustomExpressError } from "#/common/errors/CustomExpress.error";

export class ServicesController extends Controller {

	async all() {
		// const res = await this.CONN
		// 	.from("servicios_en_revision")
		// 	.select("service_name, on_revision");

		// if (res.error) return this.next(new CustomExpressError(res.status, res.statusText, res.error.details))
		// if (!res.data.length) return this.next(new CustomExpressError(404, "Not found", "No services found"))

		// const record = {};
		// for (const { service_name, on_revision } of res.data) {
		// 	record[service_name] = on_revision;
		// }

		// return this.res.status(res.status).send(this.convertBinary(record));
	}

	async toggleStatus() {
		// const toggleQ = this.req.query.toggle as string;
		// /**
		//  *  On selected services toggle current boolean value.
		// */
		// const res1 = await this.CONN.from("servicios_en_revision")
		// 	.select("service_name, on_revision")
		// 	.in("service_name", toggleQ.split(","))

		// if (res1.error) return this.next(new CustomExpressError(res1.status, res1.statusText, res1.error.details))

		// const updates = res1.data!.map((x) => ({
		// 	service_name: x.service_name,
		// 	on_revision: !x.on_revision,
		// }));

		// const res2 = await this.CONN
		// 	.from("servicios_en_revision")
		// 	.upsert(updates);

		// if (res2.error) return this.next(new CustomExpressError(res2.status, res2.statusText, res2.error.details))

		// return this.res.status(res2.status).send(res2.statusText);
	}

	async add() {

		// const res = await this.CONN
		// 	.from("servicios_en_revision")
		// 	.insert(this.req.body);

		// if (res.error) return this.next(new CustomExpressError(res.status, res.statusText, res.error.details))

		// return this.res.status(res.status).send(res.statusText);

	}

	async delete() {
		// const namesQ = this.req.query.names as string;
		// const res = await this.CONN.from("servicios_en_revision")
		// 	.delete()
		// 	.in("service_name", namesQ.split(","));

		// if (res.error) return this.next(new CustomExpressError(res.status, res.statusText, res.error.details))

		// return this.res.status(res.status).send(res.statusText);
	}
}
