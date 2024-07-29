import * as esbuild from "esbuild";

/**
 *  Configuration must be setted specifically for CommonJS
 *  due to Single Executable Application specification
 *  as it only recognises cjs
 */
const devMode = process.env.NODE_ENV === "development";
console.log(`Bundled in: ${process.env.NODE_ENV} MODE`);

await esbuild.build({
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
