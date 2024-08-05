import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { ServerEndpoint } from "@/api/server";
import { LoginFields } from "@/constants/login-fields";
import { generatedFileName } from "@/constants/random";
import { ServiceDashboards } from "@/constants/service-dashboards";
import { ServiceOnRevision } from "@/constants/service-on-revision";
import type { ISupportedServices } from "@/constants/services";
import { StepsToLogin } from "@/constants/steps-to-login";
import { StepsToPay } from "@/constants/steps-to-pay";
import { EnvSchema, type IEnvSchema } from "@/constants/typed-env";
import { firstTimePrompt } from "@/prompts/startup/firstTime.prompt";
import type { IServiceLoginFields } from "@/schemas/serviceLoginField.schema";
import { type IUserData, UserDataManager } from "@/schemas/userData.schema";
import type { IServiceData } from "@/types/api";
import { cancel, log, note, outro, spinner } from "@clack/prompts";
import picocolors from "picocolors";
import type { Browser, BrowserContext, Page } from "playwright-core";
import { getDefaultsForSchema } from "zod-defaults";
import { encryptData } from "./crypto";
import { ApiError } from "./errors/API.error";
import { conjunctionList } from "./random";

/**
 *  Used to hide not so important things \
 *  from the main Sequence.
 */
export class SequenceUtilities {
	static ENV: IEnvSchema;
	static DEV_MODE: boolean;
	static DEBUG_MODE = process.argv.includes("--debug");

	#_STEP = 0;
	protected get STEP() {
		return this.#_STEP;
	}
	protected FIRST_TIME = false;
	protected FILE_PATH = path.join(path.resolve(), generatedFileName);

	protected set STEP(n: number) {
		if (SequenceUtilities.DEBUG_MODE) log.message(`DEBUG: Step ${n}`);
		this.#_STEP = n;
	}

	protected _DATA!: IUserData;
	protected get DATA(): IUserData {
		return this._DATA;
	}

	protected set DATA(d: IUserData) {
		if (SequenceUtilities.DEBUG_MODE)
			note(JSON.stringify(d, null, 2), "[DEBUG]");
		this._DATA = d;
	}

	protected PASS!: string;
	protected BROWSER: Browser | null = null;
	protected CTX: BrowserContext | null = null;
	/**
	 *  The first time an user fetchs to pages. \
	 *  `null` value means unavailable because of an error, \
	 *  dont mistake with services on revision.
	 */
	protected CURRENT_WEBS = new Map<
		ISupportedServices,
		{ page: Page; dashboard: string } | null
	>();

	static ServiceData: IServiceData = {} as IServiceData;
	static {
		const res = EnvSchema.safeParse({
			stage: "__APP-STAGE",
			backend_endpoint: "__API-ENDPOINT",
		});

		if (res.error) {
			log.error(
				conjunctionList(
					res.error.errors.map((x) => `${x.path.join("")}: ${x.message}`),
				),
			);
			process.exit(1);
		}
		SequenceUtilities.ENV = res.data;
		SequenceUtilities.DEV_MODE = res.data.stage === "development";
	}

	//  Utilities

	protected async getApiResponses() {
		const sp = spinner();
		sp.start("Obteniendo información de servicios, esto puede tardar");
		const responses = await Promise.allSettled(
			Object.values(ServerEndpoint).map((x) => x()),
		);

		const failIndexes: string[] = [];
		for (const res of responses) {
			if (res.status === "fulfilled") {
				if (!res.value.data)
					failIndexes.push(picocolors.underline(res.value.key));
				else {
					SequenceUtilities.ServiceData[res.value.key] = res.value.data as any;
					SequenceUtilities.DEBUG_MODE &&
						note(
							JSON.stringify(SequenceUtilities.ServiceData[res.value.key]),
							"[DEBUG]",
						);
				}
			}
		}
		if (failIndexes.length) {
			sp.stop(
				`Hubo un error al contactar con el servidor: ${picocolors.bgWhite(SequenceUtilities.ENV.backend_endpoint)}`,
			);
			log.error(`Falló el indice: ${conjunctionList(failIndexes)}`);
			throw new ApiError();
		}
		sp.stop("Información obtenida");
	}

	/**
	 * Writes the encrypted data into `FILE_PATH`
	 */
	protected async regenerateFile(): Promise<void> {
		try {
			const password = await firstTimePrompt();
			await fs.writeFile(
				this.FILE_PATH,
				JSON.stringify(
					encryptData(
						password,
						getDefaultsForSchema(UserDataManager.getLastSchema()),
					),
				),
				"utf-8",
			);
		} catch (error) {
			this.exceptionTermination(error);
		}
	}

	/**
	 *  Uses current context to validate selected service.
	 */
	protected async validateService(
		service: ISupportedServices,
		fields: Omit<IServiceLoginFields, "aliasRef">,
	) {
		try {
			const defaultResult = { service, data: null };
			if (ServiceOnRevision[service]) return defaultResult;

			const page = await this.#isPageAvailable(service);
			if (!page) return defaultResult;

			const goodResponse = await this.#navigateToDashboard(
				page,
				service,
				fields,
			);
			if (!goodResponse) return defaultResult;

			return { service, data: { page, dashboard: ServiceDashboards[service] } };
		} catch (error) {
			return this.exceptionTermination(error);
		}
	}

	async #isPageAvailable(service: ISupportedServices): Promise<Page | null> {
		try {
			const page = await this.CTX!.newPage();
			return await StepsToLogin[service](page);
		} catch (error) {
			if (SequenceUtilities.DEBUG_MODE) console.log(error);
			return null;
		}
	}

	/**
	 *  Login selectors are no that common to be replaced.
	 *  If any of the field locators fails, throw `false`.
	 *
	 * @returns Wheter the login was succesful or not.
	 */
	async #navigateToDashboard(
		page: Page,
		service: ISupportedServices,
		fieldData: Omit<IServiceLoginFields, "aliasRef">,
	): Promise<boolean> {
		const field = LoginFields[service];
		const maxTimeout = 40_000; // 40 secs

		try {
			const userInput = await page.waitForSelector(field.username);
			await userInput.fill(fieldData.username!);

			const passInput = await page.waitForSelector(field.password);
			await passInput.fill(fieldData.password!);

			const submit = await page.waitForSelector(field.submit);
			await submit.click();

			const waitLogin = async () => {
				const start = Date.now();
				while (Date.now() - start < maxTimeout) {
					if (page.url().includes(ServiceDashboards[service])) {
						return true;
					}
					await page.waitForTimeout(1000); //  Wait 1 second before checking again
				}
				return false;
			};

			const success = await waitLogin();
			if (!success)
				log.warning(
					`Ha ocurrido un error al iniciar sesión en ${picocolors.underline(service)} \n, revise sus credenciales.`,
				);

			return success;
		} catch (error) {
			log.error(
				`Ha ocurrido un error al ${picocolors.underline("tratar")} de iniciar sesión en ${picocolors.underline(service)}, \nverifique sus credenciales sean correctas o que el servicio ${page.url()} esté disponible.`,
			);
			note(JSON.stringify(error, null, 2), "Error detallado");
			return false;
		}
	}

	/**
	 *  TODO: Manage cases user loses current session or for \
	 *  some reason by navite page code navigates to login url.
	 *
	 *  Possible solution: repeat log-in and navigation steps \
	 *  and trigger this method.
	 */
	protected async payService(service: ISupportedServices): Promise<void> {
		const method = this.DATA.paymentMethods.find(
			(x) => x!.uuid === this.DATA.serviceFields[service]?.aliasRef,
		)!;
		log.info(`Pagando ${service}..`);
		try {
			const current = this.CURRENT_WEBS.get(service)!;
			const res = await StepsToPay[service](current.page, method);

			if (res === null)
				log.success(`¡${picocolors.underline(service)} pagado correctamente!`);
			else
				log.error(
					`No se ha podido pagar ${picocolors.underline(service)}, razón: \n${res} `,
				);
		} catch (error) {
			return this.exceptionTermination(error);
		}
	}

	/**
	 *  Saves current data.
	 */
	protected async update() {
		try {
			await fs.writeFile(
				this.FILE_PATH,
				JSON.stringify(encryptData(this.PASS, this.DATA)),
			);
			log.info("Datos guardados correctamente.");
		} catch (error) {
			this.exceptionTermination(error);
		}
	}

	/** Terminate program with an unknown error successfully. */
	protected async exceptionTermination(e: unknown) {
		await this.closeWeb();
		!SequenceUtilities.DEBUG_MODE &&
			log.info(
				"Prueba ejecutar el CLI con el argumento '--debug'\npara mayor detalle y replica los pasos",
			);
		cancel(
			`Ha ocurrido un error en el [Paso ${this.STEP}]:\n${(e as Error).message}`,
		);
		return process.exit(0);
	}

	/** Terminate program successfully. */
	protected async outroTermination() {
		await this.closeWeb();
		outro(
			picocolors.green(
				"✨ Gracias por utilizar esta herramienta, considera hacer un \naporte añadiendo servicios o donando para que sigamos creciendo :]",
			),
		);
		return process.exit(0);
	}

	/**
	 *  If exists terminates web navigator & context.
	 */
	protected async closeWeb() {
		await this.CTX?.close();
		await this.BROWSER?.close();
	}
}
