#!/usr/bin/env node
import { cancel, intro, log, note, outro } from "@clack/prompts";
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page
} from "@playwright/test";
import isOnline from "is-online";
import nodeCleanup from "node-cleanup";
import fs from "node:fs/promises";
import path from "node:path";
import { cwd, exit } from "node:process";
import picocolors from "picocolors";
import { getDefaultsForSchema } from "zod-defaults";
import "zx/globals";
import { LoginFields } from "./constants/login-fields";
import { AppPackage, generatedFileName } from "./constants/random";
import { ServicePages } from "./constants/service-pages";
import { StepsToLastBill } from "./constants/steps-to-last-bill";
import { StepsToLogin } from "./constants/steps-to-login";
import { StepsToPay } from "./constants/steps-to-pay";
import { selectMenuActionPrompt } from "./prompts/selectMenuAction.prompt";
import { changePasswordPrompt } from "./prompts/startup/changePassword.prompt";
import { decryptPrompt } from "./prompts/startup/decrypt.prompt";
import { firstTimePrompt } from "./prompts/startup/firstTime.prompt";
import { chooseSupportedServicePrompt } from "./prompts/supported-services/chooseSupportedService.prompt";

import { ServiceDashboards } from "./constants/service-dashboards";
import type { ISupportedServices } from "./constants/services";
import { choosePaymentMenuPrompt } from "./prompts/payment-methods/choosePaymentMenu.prompt";
import { EncryptedDataManager } from "./schemas/encryptedData.schema";
import { IUserData, UserDataManager } from "./schemas/userData.schema";
import { encryptData } from "./utils/crypto";
import { getServicesWithFilledLogins } from "./utils/random";

const startAt = Date.now();
nodeCleanup((exitCode) =>
	console.log(
		exitCode
			? `${picocolors.red(picocolors.bold("error"))} El programa falló con código de error ${exitCode}.`
			: `Programa finalizado sin errores, duró ${((Date.now() - startAt) / 1000).toFixed(2)}s.`,
	),
);

class Sequence {
	static #DEBUG_MODE =
		process.argv.includes("--debug") && process.env.NODE_ENV === "dev";

	static #_STEP = 0;
	static get #STEP() {
		return this.#_STEP;
	}
  static #FIRST_TIME = false;
  static #FILE_PATH = path.join(cwd(), generatedFileName);

	static set #STEP(n: number) {
		if (this.#DEBUG_MODE) note(`Step ${n}`, "[DEBUG]");
		this.#_STEP = n;
	}

	static #_DATA: IUserData;
	static get #DATA(): IUserData {
		return this.#_DATA;
	}

	static set #DATA(d: IUserData) {
		if (this.#DEBUG_MODE) note(JSON.stringify(d, null, 2), "[DEBUG]");
		this.#_DATA = d;
	}

	static #PASS: string;
	static #BROWSER: Browser | null = null;
	static #CTX: BrowserContext | null = null;
	/**
	 *  The first time an user fetchs to pages
	 */
	static #CURRENT_WEBS = new Map<
		ISupportedServices,
		{ page: Page; dashboard: string }
	>();


	static async initialize() {
		intro(picocolors.inverse(` v ${AppPackage.version} `));
		if (this.#DEBUG_MODE) log.warning(picocolors.bgYellow("[DEBUG MODE]"));
		note(
			`Una herramienta moderna para pagar tus \ncuentas de forma segura y automatica.`,
			"CLI-Pago_mis_servicios",
		);
		log.info(`Creado y mantenido por ${picocolors.blue(AppPackage.author)}`);
		log.warning(
			`Si estas teniendo problemas usando la aplicación compartelo \nen: ${AppPackage.repository.url}`,
		);

		await this.#checkFile();
	}

	/**
	 *  Ensures user's info file exists, if not recreates it \
	 *  with default data and encrypts it with a hashed password.
	 *
	 *  @description Step 1
	 */
	static async #checkFile(): Promise<void> {
		this.#STEP = 1;
		try {
			const file = await fs.readFile(this.#FILE_PATH, "utf-8");

			const validJson = EncryptedDataManager.getLastSchema().safeParse(JSON.parse(file))
			if (!validJson.success) {
				log.error(
					`Algunos datos del archivo '${generatedFileName}' son invalidos, \n este archivo no debe ser modificado bajo ninguna circunstancia. \n${JSON.stringify(validJson.error.flatten().fieldErrors, null, 2)}`,
				);
				exit(1);
			}
			const { password, userData } = await decryptPrompt(validJson.data,this.#FILE_PATH);
			this.#DATA = userData;
			this.#PASS = password;

			this.#FIRST_TIME = !Boolean(getServicesWithFilledLogins(this.#DATA).length);

      await this.#waitForUserMenuAction()
		} catch (_) {
			/**
			 * Catch will only trigger if the file is not present
			 * in the current directory.
			 */
			log.warning(
				`El archivo '${generatedFileName}' no se ha encontrado, recreando...`,
			);
			await this.#regenerateFile();
			await this.#checkFile();
		}
	}

	static async #regenerateFile(): Promise<void> {
		try {
			const password = await firstTimePrompt();
			await fs.writeFile(
				this.#FILE_PATH,
				JSON.stringify(
					encryptData(
						password,
						getDefaultsForSchema(UserDataManager.getLastSchema()),
					),
				),
        "utf-8"
			);
		} catch (error) {
			this.#exceptionTermination(error);
		}
	}

	/**
	 *
	 * @description Step 2
	 */
	static async #waitForUserMenuAction(): Promise<void> {
		this.#STEP = 2;
		try {
			const action = await selectMenuActionPrompt(this.#DATA, this.#FIRST_TIME);
			switch (action) {
				case "next":
					if (this.#FIRST_TIME) return await this.#waitForUserMenuAction();
					return await this.#checkSelectedServices();
				case "serviceFields":
					await chooseSupportedServicePrompt(this.#DATA);
					await this.#update();
					return await this.#waitForUserMenuAction();
				case "paymentMethods":
					await choosePaymentMenuPrompt(this.#DATA);
					await this.#update();
					return await this.#waitForUserMenuAction();
				case "password":
					this.#PASS = await changePasswordPrompt(this.#PASS);
					await this.#update();
					return await this.#waitForUserMenuAction();
        case "secureMode":
          this.#DATA.secureMode = !this.#DATA.secureMode;
          await this.#update()
          return await this.#waitForUserMenuAction()
				default:
          return this.#outroTermination()
			}
		} catch (error) {
			this.#exceptionTermination(error);
		}
	}

	/**
	 *
	 * @description Step 3
	 */
	static async #checkSelectedServices(): Promise<void> {
		this.#STEP = 3;
		const currentSelection = getServicesWithFilledLogins(this.#DATA)
		try {

			const connection = await isOnline();
			if (!connection) {
        log.error("Sin internet, volviendo al menú..")
        setTimeout(async()=> await this.#waitForUserMenuAction(),2000)
        return
      }

			if (!currentSelection.length) {
        log.error("Sin servicios al que navegar, volviendo al menú..")
        setTimeout(async()=> await this.#waitForUserMenuAction(), 2000);
        return
      }


			/**
       * 	When user navigates to [Step 2] from
			 * 	[Step 4] this [Step 3] should resolve
       * 	only when currentSelection is equal to CURRENT_WEBS
       * 	else should navigate to the new selected webs.
       *  This is to not open new context nor pages.
       *
       *  IDK what to do if any of the services in the new loop are not available.
      */

      // const previousLoop = currentSelection.filter(x=> this.#CURRENT_WEBS.has(x.service));
      // console.log(previousLoop);

			// const isEqualToPreviusLoop = previousLoop.every(Boolean);
			// if (isEqualToPreviusLoop || this.#BROWSER) Promise.resolve();

			this.#BROWSER = await chromium.launch({ headless: false });
			this.#CTX = await this.#BROWSER.newContext();

      log.info(`Validando que ${currentSelection.length > 1 ? `tus ${currentSelection.length} servicios esten disponibles..` : `tu servicio esté disponible..`}`)
			for await (const {service}of currentSelection) {
				const page = await this.#isPageAvailable(service);
				if (!page)  break
        const badResponse = await this.#navigateToDashboard(page, service);
        if(!badResponse) break
        this.#CURRENT_WEBS.set(service, { page, dashboard: ServiceDashboards[service] });
			}

      if(!this.#CURRENT_WEBS.size){
        log.warning(`No se hay servicios seleccionados disponibles a los que navegar`)
        setTimeout(async() => await this.#waitForUserMenuAction(), 2000);
        return;
      }

      await this.#checkForBills()
		} catch (error) {
      this.#exceptionTermination(error)
    }
	}

	static async #isPageAvailable(
		service: ISupportedServices,
	): Promise<Page | null> {
		try {
			const page = await this.#CTX!.newPage();
			await page.goto(ServicePages[service]);

			if (StepsToLogin[service] === undefined) return page;

			return await StepsToLogin[service]!(page);
		} catch (error) {
      if(this.#DEBUG_MODE) console.log(error)
			return null;
		}
	}

  /**
   * @returns Wheter the login was succesful or not.
   */
	static async #navigateToDashboard(
		page: Page,
		service: ISupportedServices,
	): Promise<boolean> {
		const field = LoginFields[service];
		const fieldData = this.#DATA.serviceFields[service]!;

		try {
      await page.waitForLoadState("domcontentloaded")

			const userInput = page.locator(field.username);
			await userInput.waitFor();
			await userInput.fill(fieldData.username!);

			const passInput = page.locator(field.password);
			await passInput.waitFor();
			await passInput.fill(fieldData.password!);

			const submit = page.locator(field.submit);
			await submit.waitFor();
			await submit.click();

      const res = await page.waitForResponse(field.loginEndpoint)
      if(res.ok()) return true

      log.warning(`Ha ocurrido un error al iniciar sesión, revise que las \ncredenciales de ${picocolors.underline(service)} sean correctas. \nO revise que no haya ningun error en ${picocolors.underline(ServicePages[service])}`)

      return false
		} catch (error) {
      return this.#exceptionTermination(error)
    }
	}

	/**
   *  Navigate to bills page and check for last one, then returns to dashboard
   *
	 *  @description Step 4
	 */
	static async #checkForBills() {
		this.#STEP = 4;
    try {
      log.info("Buscando ultima factura..")
      const bills = new Map<ISupportedServices,string|null>()
      for await (const [service, {dashboard,page}] of this.#CURRENT_WEBS) {
        const { bill } = await StepsToLastBill[service](page)
        bills.set(service, bill)
      }


    } catch (error) {
      return this.#exceptionTermination(error)
    }
	}


	/**
	 *
	 * @description Step 5 - Final
	 */
	// static async #waitForActionInBillSelection(): Promise<void> {
	// 	this.#STEP = 5;
	// 	// try {
    // const answer = await chooseBillToPayPrompt(
    //   [...this.#CURRENT_WEBS].map(x=> ({}))
    // );
    // switch (answer) {
    //   case 'all':
    //     return await this.#waitForActionInBillSelection();
    //   case 'exit':
    //     return await this.#waitForUserMenuAction();
    //   default:
    //     const bill = await this.#lookForBill(answer);
    //     if (bill) log.info(`Monto a pagar: ${bill}`);
    //     else
    //       log.error(
    //         'No se ha podido encontrar el monto a pagar, \n nuestros metodos pueden estar desactualizados, \n pongase en contacto con el autor para mas información.',
    //       );
    //     return await this.#waitForActionInBillSelection();
    // }
	// 	// } catch (error) {
	// 	//   this.exceptionTermination(error);
	// 	// }
	// }

	static async #navigateToPayForm(service: ISupportedServices) {
		try {
			const { page } = this.#CURRENT_WEBS.get(service)!;
			for (const step of Object.values(StepsToPay[service]!)) {
				const element = page!.locator(step);
				await element.waitFor();
				await element.click();
			}
		} catch (error) {
			log.error(JSON.stringify(error));
		}
	}

	//  Utilities section
	/**
	 *  Saves current data.
	 */
	static async #update() {
		try {
			const filePath = path.join(cwd(), generatedFileName);
			await fs.writeFile(
				filePath,
				JSON.stringify(encryptData(this.#PASS, this.#DATA)),
			);
			log.info("Datos guardados correctamente.");
		} catch (error) {
			this.#exceptionTermination(error);
		}
	}

	static #exceptionTermination<T>(e: unknown) {
		cancel(
			`Ha ocurrido un error inesperado en el [Step ${this.#STEP}]: \n${JSON.stringify(e, null, 2)}`,
		);
		return exit(0);
	}
  static #outroTermination(){
    outro(
      picocolors.green(
        "✨ Gracias por utilizar esta herramienta, considera hacer un aporte :)",
      ),
    );
   exit(0);
  }
}

await Sequence.initialize()
