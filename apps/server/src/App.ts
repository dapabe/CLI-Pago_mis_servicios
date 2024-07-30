import express, { Router } from "express";
import * as http from "node:http";
import { AppRoutes } from "./Router";
import logger from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as rfs from "rotating-file-stream";
import path from "node:path";
import type { IAppInitFlags } from "./common/types/app-flags";
import { GlobalErrorMiddleware } from "./middlewares/global-error.middleware";
import { Client } from "@libsql/client/.";

export class App {
	#APP_CONFIG: IAppInitFlags;
	readonly #EXP = express();
	readonly #SERVER = http.createServer(this.#EXP);

	constructor(initConfig: Partial<IAppInitFlags>) {
		this.#APP_CONFIG = initConfig;
	}

	/**
	 *  Start server
	 */
	async start(): Promise<http.Server> {
		this.#configureExpress();
		this.#configureRouter();

		return this.#SERVER;
	}

	/**
	 * Config express middlewares
	 */
	#configureExpress(): void {
		const loggerFormat = ":remote-addr :remote-user [:date[iso]] :method :url HTTP/:http-version :status :res[content-length] | :response-time ms"
		if (this.#APP_CONFIG.loggerPath) {
			const stream = rfs.createStream("server.log", {
				interval: "1d",
				compress: true,
				path: path.join(path.resolve(), this.#APP_CONFIG.loggerPath),
			});
			this.#EXP.use(logger(loggerFormat, { stream }));
		} else this.#EXP.use(logger(loggerFormat))

		this.#EXP.use(express.json());

		this.#EXP.use(express.urlencoded({ extended: true }));

		//  Protection middlewares

		this.#EXP.use(
			rateLimit({
				windowMs: 60_000,
				limit: 40,
				standardHeaders: true,
			}),
		);

		this.#EXP.use(helmet());

		this.#EXP.use((_, res, next): void => {
			res.header("Access-Control-Allow-Origin", "*");
			res.header(
				"Access-Control-Allow-Headers",
				"X-Requested-With, Content-Type",
			);
			res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
			next();
		});
	}

	#configureRouter(): void {
		// this.#EXP.use(
		// 	"/",
		// 	Router().get("/", (_1, _2) => {
		// 		throw new CustomExpressError(501, "Test error", "Expected outcome")
		// 	})
		// )

		this.#EXP.use(
			"/ping",
			Router().get("/", (_, res) => res.status(200).send()),
		);

		for (const [version, routes] of Object.entries(AppRoutes)) {
			for (const config of routes) {
				this.#EXP.use(
					`/api${version}${config.route.BASE_ROUTE_NAME}`,
					...config.middlewares,
					config.route.ROUTER,
				);
			}
		}

		this.#EXP.use(GlobalErrorMiddleware)

		this.#EXP.use((_, res): void => {
			res.status(404).send()
		});
	}
}
