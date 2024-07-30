import { defineConfig } from "tsup";

export default defineConfig(async (opts) => {
	return {
		format: "esm",
		clean: true,
		entry: ["src/index.ts"],
		minify: opts.env?.NODE_ENV === "production",
	};
});
