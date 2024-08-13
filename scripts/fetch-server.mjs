import { intro, spinner } from "@clack/prompts";
import mspack from "@msgpack/msgpack";
import fs from "node:fs";
import path from "node:path";

const jsonFile = "service-statuses.json";

intro("Getting up-to-date data from server");
const sp = spinner();
sp.start("Fetching");

fetch(`${process.env.BACKEND_ENDPOINT}/api/v1/services/statuses`)
	.then(async (res) => {
		const statusBad = [500, 404].some((x) => x === res.status);
		if (!res.ok || statusBad)
			throw new Error(`${res.status} - ${res.statusText}`);
		sp.message(`Writing into ${jsonFile}`);

		const data = mspack.decode(new Uint8Array(await res.arrayBuffer()));
		fs.writeFileSync(
			path.resolve(import.meta.dir, jsonFile),
			JSON.stringify(data),
			"utf8",
		);
		sp.message(`Finished writing into ${jsonFile}`);
	})
	.catch((x) => {
		sp.stop(x.message);
		process.exit(1);
	})
	.finally(() => sp.stop("Finished I/O operation"));
