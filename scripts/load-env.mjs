import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const nEnv = process.env.NODE_ENV || "development";
const appName = process.env.APP_NAME;

if (!appName) {
	console.error("APP_NAME enviroment variable is not set.");
	process.exit(1);
}

const envPath = path.resolve(process.cwd(), "apps", appName, `.env.${nEnv}`);

if (!fs.existsSync(envPath)) {
	console.error(
		`No enviroment variable file found for NODE_ENV=${nEnv} in app APP_NAME=${appName}`,
	);
	process.exit(1);
}

dotenv.config({ path: envPath });
console.log(`Loaded ${envPath}`);
