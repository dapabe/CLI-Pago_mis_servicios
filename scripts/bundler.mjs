import * as esbuild from "esbuild";
import { replace } from "esbuild-plugin-replace";
/**
 *  Configuration must be setted specifically for CommonJS
 *  due to Single Executable Application specification
 *  as it only recognises cjs
 *
 * 	Replace plugin is needed as of right now embedding .env files
 * 	or using `process.env` wont do anything. Instead the selected values
 * 	are replaced on build-time.
 */
const devMode = process.env.NODE_ENV === "development";

await esbuild.build({
	plugins: [
		replace({
			values: {
				"__APP-STAGE": process.env.NODE_ENV,
				"__API-ENDPOINT": process.env.BACKEND_ENDPOINT,
			},
		}),
	],
	entryPoints: ["src/index.ts"],
	platform: "node",
	bundle: true,
	minify: !devMode,
	target: ["node15"],
	format: "cjs",
	external: [
		"./chromium/appIcon.png", //  playwright-core
		"./loader", //  playwright-core
	],
	legalComments: "inline",
	// outdir: "dist",
	outfile: "dist/index.cjs",
	packages: "bundle",
	// logLevel: "verbose",
});
