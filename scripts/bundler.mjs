import { outro } from "@clack/prompts";
import { cancel } from "@clack/prompts";
import { log } from "@clack/prompts";
import { intro } from "@clack/prompts";

const devMode = process.env.NODE_ENV === "development";

intro("Bundling app");
const res = await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	minify: !devMode,
	target: "node",
	external: [
		"*.png", //  playwright-core
		// "./loader", //  playwright-core
	],
	define: {
		NODE_ENV: process.env.NODE_ENV,
		BACKEND_ENDPOINT: process.env.BACKEND_ENDPOINT,
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
