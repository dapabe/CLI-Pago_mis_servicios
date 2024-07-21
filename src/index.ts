#!/usr/bin/env node
import { intro, log, note } from "@clack/prompts";
import { chromium } from "@playwright/test";
import isOnline from "is-online";
import nodeCleanup from "node-cleanup";
import fs from "node:fs/promises";
import { exit } from "node:process";
import picocolors from "picocolors";
import {
	AppPackage,
	ContextRouteURLs,
	generatedFileName,
} from "./constants/random";
import { type BillData, StepsToLastBill } from "./constants/steps-to-last-bill";
import { selectMenuActionPrompt } from "./prompts/selectMenuAction.prompt";
import { changePasswordPrompt } from "./prompts/startup/changePassword.prompt";
import { decryptPrompt } from "./prompts/startup/decrypt.prompt";
import { chooseSupportedServicePrompt } from "./prompts/supported-services/chooseSupportedService.prompt";

import { ServiceOnRevision } from "./constants/service-on-revision";
import type { ISupportedServices } from "./constants/services";
import { chooseBillToPayPrompt } from "./prompts/bill-context/chooseBillToPay.prompt";
import { choosePaymentMenuPrompt } from "./prompts/payment-methods/choosePaymentMenu.prompt";
import { EncryptedDataManager } from "./schemas/encryptedData.schema";
import type { IBillContext } from "./types/generic";
import { getServicesWithAllFilledLogins, sortBills } from "./utils/random";
import { SequenceUtilities } from "./utils/SequenceUtilities";

const startAt = Date.now();
nodeCleanup((exitCode) =>
	console.log(
		exitCode
			? `${picocolors.red(picocolors.bold("error"))} El programa falló con código de error ${exitCode}.`
			: `Programa finalizado correctamente, duró ${((Date.now() - startAt) / 1000).toFixed(2)}s.`,
	),
);

class Sequence extends SequenceUtilities {
	public async initialize() {
		intro(picocolors.inverse(` v ${AppPackage.version} `));
		if (SequenceUtilities.DEBUG_MODE)
			log.warning(picocolors.bgYellow("[DEBUG MODE]"));
		note(
			"Una herramienta moderna para pagar tus \ncuentas de forma segura y automatica.",
			"CLI-Pago_mis_servicios",
		);
		log.info(`Creado y mantenido por ${picocolors.blue(AppPackage.author)}`);
		log.warning(
			`Si estas teniendo problemas usando la aplicación compartelo \nen: ${AppPackage.repository.url}`,
		);

		await this.#checkFile().catch(this.exceptionTermination);
	}

	/**
	 *  Ensures user's info file exists, if not recreates it \
	 *  with default data and encrypts it with a hashed password.
	 *
	 *  @description Step 1
	 */
	async #checkFile(): Promise<void> {
		this.STEP = 1;
		try {
			const file = await fs.readFile(this.FILE_PATH, "utf-8");

			const validJson = EncryptedDataManager.getLastSchema().safeParse(
				JSON.parse(file),
			);
			if (!validJson.success) {
				log.error(
					`Algunos datos del archivo '${generatedFileName}' son invalidos, \n este archivo no debe ser modificado bajo ninguna circunstancia. \n${JSON.stringify(validJson.error.flatten().fieldErrors, null, 2)}`,
				);
				exit(1);
			}
			const { password, userData } = await decryptPrompt(
				validJson.data,
				this.FILE_PATH,
			);
			this.DATA = userData;
			this.PASS = password;

			this.FIRST_TIME = getServicesWithAllFilledLogins(this.DATA).length === 0;

			await this.#waitForUserMenuAction();
		} catch (_) {
			/**
			 * Catch will only trigger if the file is not present
			 * in the current directory.
			 */
			log.warning(
				`El archivo '${generatedFileName}' no se ha encontrado, recreando...`,
			);
			await this.regenerateFile();
			await this.#checkFile();
		}
	}

	/**
	 *
	 * @description Step 2
	 */
	async #waitForUserMenuAction(): Promise<void> {
		this.STEP = 2;

		const action = await selectMenuActionPrompt(this.DATA, this.FIRST_TIME);
		switch (action) {
			case "next":
				if (this.FIRST_TIME) return await this.#waitForUserMenuAction();
				return await this.#checkSelectedServices();
			case "serviceFields":
				await chooseSupportedServicePrompt(this.DATA);
				await this.update();
				return await this.#waitForUserMenuAction();
			case "paymentMethods":
				await choosePaymentMenuPrompt(this.DATA);
				await this.update();
				return await this.#waitForUserMenuAction();
			case "password":
				this.PASS = await changePasswordPrompt(this.PASS);
				await this.update();
				return await this.#waitForUserMenuAction();
			case "secureMode":
				this.DATA.secureMode = !this.DATA.secureMode;
				await this.update();
				return await this.#waitForUserMenuAction();
			default:
				return this.outroTermination();
		}
	}

	/**
	 *
	 * @description Step 3
	 */
	async #checkSelectedServices(): Promise<void> {
		this.STEP = 3;
		const currentSelection = getServicesWithAllFilledLogins(this.DATA);

		const connection = await isOnline();
		if (!connection) {
			log.error("Sin internet, volviendo al menú..");
			setTimeout(async () => await this.#waitForUserMenuAction(), 2000);
			return;
		}

		if (!currentSelection.length) {
			log.error("Sin servicio al que navegar, volviendo al menú..");
			setTimeout(async () => await this.#waitForUserMenuAction(), 2000);
			return;
		}

		const proceed = async () => {
			log.info("Buscando ultima factura..");
			return await this.#checkForBills();
		};

		/**
		 * 	When user navigates to [Step 2] from
		 * 	[Step 4] this [Step 3] should resolve
		 * 	only when CURRENT_WEBS is already defined
		 *  or is defined after validating current services.
		 *
		 *  This should not open new context nor pages.
		 *
		 *  IDK what to do if any of the services in the new loop are not available.
		 */

		// if (this.#BROWSER) return await proceed()
		if (this.BROWSER) await this.closeWeb();

		this.BROWSER = await chromium.launch({ headless: false });
		this.CTX = await this.BROWSER.newContext({ locale: "es-AR" });
		this.CTX.setDefaultNavigationTimeout(60_000);
		this.CTX.route(
			SequenceUtilities.DEV_MODE ? ContextRouteURLs.DEV : ContextRouteURLs.PROD,
			(route) => route.abort(),
		);

		log.info(
			`Validando que ${currentSelection.length > 1 ? `tus ${currentSelection.length} servicios esten disponibles..` : "tu servicio esté disponible.."} (Iniciando sesión)`,
		);
		log.warning("Esto puede tardar un poco.");

		const results = await Promise.allSettled(
			currentSelection.map((x) => this.validateService(x.service, x.fields)),
		);
		for (const res of results) {
			if (res.status === "fulfilled") {
				this.CURRENT_WEBS.set(res.value.service, res.value.data);
			}
		}

		return await proceed();
	}

	/**
	 *  Navigate to bills page and check the last bill then returns to dashboard.
	 *  This method is also used after paying bill/s. (WIP)
	 *
	 *  @description Step 4
	 */
	async #checkForBills(): Promise<void> {
		this.STEP = 4;

		if (!this.CURRENT_WEBS) throw Error("NO_CURRENT_WEBS"); //  If code is well written this shouldn't happen.
		const bills = new Map<ISupportedServices, BillData | null>();
		for (const [service, value] of [...this.CURRENT_WEBS]) {
			if (!value) {
				bills.set(service, value);
				continue;
			}
			const data = await StepsToLastBill[service](value.page);
			if (typeof data === "string") {
				log.warning(
					`Error al obtener monto a pagar [${picocolors.underline(service)}]: \n${data}`,
				);
				bills.set(service, null);
				continue;
			}

			bills.set(service, data);
			if (value.page.url() !== value.dashboard) {
				await value.page.goto(value.dashboard);
			}
		}

		return await this.#waitForActionInBillSelection(bills);
	}

	/**
	 *
	 * @description Step 5 - Final
	 */
	async #waitForActionInBillSelection(
		currentBills: Map<ISupportedServices, BillData | null>,
	): Promise<void> {
		this.STEP = 5;

		const bills = [...currentBills]
			.map<IBillContext>(([service, data]) => ({
				service,
				data,
				onRevision: ServiceOnRevision[service],
			}))
			.sort(sortBills);
		const billsToPay = bills.filter(
			(x) => !x.onRevision && x.data && !x.data.paid,
		);

		const answer = await chooseBillToPayPrompt(bills, billsToPay);
		switch (answer) {
			case "all":
				if (!billsToPay.length)
					return await this.#waitForActionInBillSelection(currentBills);
				await Promise.allSettled(
					billsToPay.map((x) => this.payService(x.service)),
				);
				return await this.#waitForActionInBillSelection(currentBills);
			case "exit":
				return await this.#waitForUserMenuAction();
			default: {
				const current = billsToPay.find((x) => x.service === answer);
				if (current && !current.data?.paid) await this.payService(answer);
				return await this.#waitForActionInBillSelection(currentBills);
			}
		}
	}
}

await new Sequence().initialize();
