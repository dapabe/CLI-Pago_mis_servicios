import { outro } from "@clack/prompts";
import { cancel } from "@clack/prompts";
import { log } from "@clack/prompts";
import { intro } from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";

const devMode = process.env.NODE_ENV === "development";

intro("Bundling app");

const serviceStatusData = fs.readFileSync(
	path.resolve(import.meta.dir, "service-statuses.json"),
	"utf8",
);
const res = await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	minify: !devMode,
	target: "bun",
	sourcemap: "external",
	external: [
		"*.png", //  playwright-core
		// "./loader", //  playwright-core
	],
	define: {
		"Bun.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
		"Bun.env.BACKEND_ENDPOINT": `"${process.env.BACKEND_ENDPOINT}"`,
		"Bun.env.__SS1": serviceStatusData,
	},
});

if (!res.success) {
	// biome-ignore lint/complexity/noForEach: <explanation>
	res.logs.forEach((x) => {
		log.error(x.message);
	});
	cancel("Error while bundling");
} else {
	// biome-ignore lint/complexity/noForEach: <explanation>
	res.logs.forEach((x) => {
		log.message(JSON.stringify(x));
	});
	outro("Bundled succesfully");
}
