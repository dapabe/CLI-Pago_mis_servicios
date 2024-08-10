import { cancel, intro, log, outro, spinner } from "@clack/prompts";
import { $ } from "bun";
import pkg from "../package.json";
import path from "node:path";
import fs from "node:fs";
intro("Compiling into executables");

const envPath = path.resolve(process.cwd(), ".env.production");
if (!fs.existsSync(envPath)) {
	log.error("File '.env.production' not found");
	cancel("Please create said file");
}

const sp = spinner();
sp.start("Compiling");

const osTargets = [
	"bun-windows-x64-modern",
	"bun-linux-x64-modern",
	"bun-darwin-arm64",
	"bun-darwin-x64",
];

for (const os of osTargets) {
	const osMinified = os.split("-").slice(1, 2).join("-");
	await $`bun build src/index.ts --env-file=${envPath} --compile --minify --sourcemap --target=${os} --outfile dist/targets/${pkg.appName}-${osMinified}`
		.then(() => sp.message(`Finished compiling '${os}'`))
		.catch((x) => log.error(x.stderr));
}
sp.stop("Finished Compilation");
outro("Script completed");
