import { exec } from "node:child_process";
import fs from "node:fs";
import pkg from "../package.json" assert { type: "json" };
import { intro, log, outro } from "@clack/prompts";
import path from "node:path";
import { inject } from "postject";

exec(
	`npm run ${process.argv.includes("--debug") ? "dev:cli" : "build:cli"}`,
	(err, stdout, stderr) => {
		if (err) return console.log(err);
		if (stderr) return console.log(stderr);
		console.log(stdout);
	},
);

const appName = `${pkg.appName}.exe`;
const configPath = path.join(process.cwd(), "scripts", "sea-config.json");

intro("Creating node SEA");
exec(`node --experimental-sea-config ${configPath}`, (err, stdout, stderr) => {
	if (err) return console.log(err);
	if (stderr) return console.log(stderr);
});
const tempFolder = (file) => path.join(process.cwd(), "scripts", "temp", file);

log.step(`Copying node binaries files into ${appName}`);
const appPath = tempFolder(appName);
fs.copyFileSync(process.execPath, appPath);

log.step(`Injecting compiled blob binaries into ${appName}`);
const blobPath = tempFolder("out.blob");
const blobData = fs.readFileSync(blobPath);

await inject(appPath, "NODE_SEA_BLOB", blobData, {
	sentinelFuse: "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
})
	.then(log.message)
	.catch(log.error);

outro("SEA created");
