import { exec } from "node:child_process";
import fs from "node:fs";
import { intro, log, outro } from "@clack/prompts";
import path from "node:path";
import { inject } from "postject";
import { spinner } from "@clack/prompts";

const pkg = JSON.parse(
	fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8"),
);

const debug = process.argv.includes("--debug");
const tempFolder = (file) => path.resolve(process.cwd(), "dist", file);

intro("Creating node SEA");
const c1 = exec(
	`npm run ${debug ? "build:dev" : "build:prod"}`,
	(err, stdout, stderr) => {
		if (err) return console.log(err);
		if (stderr) return console.log(stderr);
	},
);
// log.step("Creating temporal .env output");
// fs.writeFileSync(
// 	tempFolder("env.json"),
// 	JSON.stringify({
// 		NODE_ENV: process.env.NODE_ENV,
// 		BACKEND_ENDPOINT: process.env.BACKEND_ENDPOINT,
// 	}),
// 	"utf-8",
// );

const appName = `${pkg.name}.exe`;
const configPath = path.join(process.cwd(), "scripts", "sea-config.json");

const c2 = exec(
	`node --experimental-sea-config ${configPath}`,
	(err, stdout, stderr) => {
		if (err) return console.log(err);
		if (stderr) return console.log(stderr);
	},
);

log.step(`Copying node binaries files into ${appName}`);
const appPath = tempFolder(appName);
fs.copyFileSync(process.execPath, appPath);

const sp = spinner();
sp.start(`Injecting compiled blob binaries into ${appName}`);
const blobPath = tempFolder("out.blob");
const blobData = fs.readFileSync(blobPath);

await inject(appPath, "NODE_SEA_BLOB", blobData, {
	sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
})
	.then(log.message)
	.catch(log.error);
sp.stop("Injected app blob");

outro("SEA created");
