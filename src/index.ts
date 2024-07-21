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
import { LoginFields } from "./constants/login-fields";
import { AppPackage, ContextRouteURLs, generatedFileName } from "./constants/random";
import { BillData, StepsToLastBill } from "./constants/steps-to-last-bill";
import { StepsToLogin } from "./constants/steps-to-login";
import { StepsToPay } from "./constants/steps-to-pay";
import { selectMenuActionPrompt } from "./prompts/selectMenuAction.prompt";
import { changePasswordPrompt } from "./prompts/startup/changePassword.prompt";
import { decryptPrompt } from "./prompts/startup/decrypt.prompt";
import { firstTimePrompt } from "./prompts/startup/firstTime.prompt";
import { chooseSupportedServicePrompt } from "./prompts/supported-services/chooseSupportedService.prompt";

import { ServiceDashboards } from "./constants/service-dashboards";
import { ServiceOnRevision } from "./constants/service-on-revision";
import type { ISupportedServices } from "./constants/services";
import { chooseBillToPayPrompt } from "./prompts/bill-context/chooseBillToPay.prompt";
import { choosePaymentMenuPrompt } from "./prompts/payment-methods/choosePaymentMenu.prompt";
import { EncryptedDataManager } from "./schemas/encryptedData.schema";
import { IServiceLoginFields } from "./schemas/serviceLoginField.schema";
import { IUserData, UserDataManager } from "./schemas/userData.schema";
import { IBillContext } from "./types/generic";
import { encryptData } from "./utils/crypto";
import { getServicesWithAllFilledLogins, sortBills } from "./utils/random";

const startAt = Date.now();
nodeCleanup((exitCode) =>
	console.log(
		exitCode
			? `${picocolors.red(picocolors.bold("error"))} El programa falló con código de error ${exitCode}.`
			: `Programa finalizado correctamente, duró ${((Date.now() - startAt) / 1000).toFixed(2)}s.`,
	),
);

class Sequence {
  static #DEV_MODE = process.env.NODE_ENV === "dev"
	static #DEBUG_MODE =
		this.#DEV_MODE && process.argv.includes("--debug");

	static #_STEP = 0;
	static get #STEP() {
		return this.#_STEP;
	}
  static #FIRST_TIME = false;
  static #FILE_PATH = path.join(cwd(), generatedFileName);

	static set #STEP(n: number) {
		if (this.#DEBUG_MODE) log.message(`DEBUG: Step ${n}`);
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
	 *  The first time an user fetchs to pages. \
   *  `null` value means unavailable because of an error, \
   *  dont mistake with services on revision.
	 */
	static #CURRENT_WEBS = new Map<
		ISupportedServices,
		{ page: Page; dashboard: string } | null
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

			this.#FIRST_TIME = !Boolean(getServicesWithAllFilledLogins(this.#DATA).length);

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
		const currentSelection = getServicesWithAllFilledLogins(this.#DATA)
		try {
			const connection = await isOnline();
			if (!connection) {
        log.error("Sin internet, volviendo al menú..")
        setTimeout(async()=> await this.#waitForUserMenuAction(), 2000)
        return;
      }

			if (!currentSelection.length) {
        log.error("Sin servicio al que navegar, volviendo al menú..")
        setTimeout(async()=> await this.#waitForUserMenuAction(), 2000);
        return;
      }

      const proceed = async () => {
        log.info("Buscando ultima factura..")
        return await this.#checkForBills()
      }

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
			if (this.#BROWSER) await this.#closeWeb()

			this.#BROWSER = await chromium.launch({ headless: false});
			this.#CTX = await this.#BROWSER.newContext({locale: "es-AR"});
      this.#CTX.setDefaultNavigationTimeout(60_000)
      this.#CTX.route(this.#DEV_MODE ? ContextRouteURLs.DEV : ContextRouteURLs.PROD, (route)=> route.abort())

      log.info(`Validando que ${currentSelection.length > 1 ? `tus ${currentSelection.length} servicios esten disponibles..` : `tu servicio esté disponible..`} (Iniciando sesión)`)
      log.warning("Esto puede tardar un poco.")

      const results = await Promise.allSettled(currentSelection.map(x=> this.#validateService(x.service, x.fields)))
      for (const res of results) {
        if(res.status === "fulfilled") {
          this.#CURRENT_WEBS.set(res.value.service, res.value.data)
        }
      }

      return await proceed()
		} catch (error) {
      this.#exceptionTermination(error)
    }
	}


	/**
   *  Navigate to bills page and check the last bill then returns to dashboard.
   *  This method is also used after paying bill/s. (WIP)
   *
	 *  @description Step 4
	 */
	static async #checkForBills():  Promise<void> {
		this.#STEP = 4;
    try {
      if(!this.#CURRENT_WEBS) throw Error("NO_CURRENT_WEBS")  //  If code is well written this shouldn't happen.
      const bills = new Map<ISupportedServices,BillData | null>()
      for (const [service, value] of [...this.#CURRENT_WEBS]) {
        if(!value) {
          bills.set(service, value)
          continue;
        }
        const data = await StepsToLastBill[service](value.page)
        if(typeof data === "string") {
          log.warning(`Error al obtener monto a pagar [${picocolors.underline(service)}]: \n${data}`)
          bills.set(service, null)
          continue
        }

        bills.set(service, data)
        if(value.page.url() !== value.dashboard) {
          await value.page.goto(value.dashboard)
        }
      }

      return await this.#waitForActionInBillSelection(bills)
    } catch (error) {
      return this.#exceptionTermination(error)
    }
	}


	/**
	 *
	 * @description Step 5 - Final
	 */
	static async #waitForActionInBillSelection(currentBills:Map<ISupportedServices, BillData | null>): Promise<void> {
		this.#STEP = 5;
		try {
      const bills = [...currentBills]
        .map<IBillContext>(([service, data])=>({service, data, onRevision: ServiceOnRevision[service]}))
        .sort(sortBills)
      const billsToPay = bills
        .filter(x=> !x.onRevision && x.data && !x.data.paid)

      const answer = await chooseBillToPayPrompt(bills, billsToPay);
      switch (answer) {
        case 'all':
          if(!billsToPay.length) return await this.#waitForActionInBillSelection(currentBills);
          await Promise.allSettled(billsToPay.map(x=> this.#payService(x.service)))
          return await this.#waitForActionInBillSelection(currentBills);
        case 'exit':
          return await this.#waitForUserMenuAction();
        default:
          const current = billsToPay.find(x=> x.service === answer)
          if(current && !current.data?.paid) await this.#payService(answer)
          return await this.#waitForActionInBillSelection(currentBills);
        }
		} catch (error) {
		  this.#exceptionTermination(error);
		}
	}

	//  Utilities section

  static async #validateService(service: ISupportedServices, fields: Omit<IServiceLoginFields,"aliasRef">){
    try {
      const defaultResult = {service, data: null};
      if(ServiceOnRevision[service]) return defaultResult

      const page = await this.#isPageAvailable(service);
      if (!page) return defaultResult

      const goodResponse = await this.#navigateToDashboard(page, service, fields);
      if(!goodResponse) return defaultResult

      return {service, data: {page, dashboard: ServiceDashboards[service]}}
    } catch (error) {
      return this.#exceptionTermination(error)
    }
  }

  static async #isPageAvailable(
		service: ISupportedServices,
	): Promise<Page | null> {
		try {
			const page = await this.#CTX!.newPage();
			return await StepsToLogin[service](page);
		} catch (error) {
      if(this.#DEBUG_MODE) console.log(error)
			return null;
		}
	}

  /**
   *  Login selectors are no that common to be replaced.
   *  If any of the field locators fails, throw `false`.
   *
   * @returns Wheter the login was succesful or not.
   */
	static async #navigateToDashboard(
		page: Page,
		service: ISupportedServices,
    fieldData: Omit<IServiceLoginFields,"aliasRef">
	): Promise<boolean> {
		const field = LoginFields[service];
    const maxTimeout = 40_000 // 40 secs

		try {
			const userInput = await page.waitForSelector(field.username);
			await userInput.fill(fieldData.username!);

			const passInput = await page.waitForSelector(field.password);
			await passInput.fill(fieldData.password!);

			const submit = await page.waitForSelector(field.submit);
			await submit.click();

      const waitLogin =async()=> {
        const start = Date.now()
        while(Date.now() - start < maxTimeout) {
          if (page.url().includes(ServiceDashboards[service])) {
            return true;
          }
          await page.waitForTimeout(1000) //  Wait 1 second before checking again
        }
        return false
      };

      const success = await waitLogin()
      if(!success) log.warning(`Ha ocurrido un error al iniciar sesión en ${picocolors.underline(service)}\n, revise sus credenciales.`)

      return success
		} catch (error) {
      log.error(`Ha ocurrido un error al ${picocolors.underline("tratar")} de iniciar sesión en ${picocolors.underline(service)}, \nverifique sus credenciales sean correctas o que el servicio ${page.url()} esté disponible.`)
      note(JSON.stringify(error,null,2),"Error detallado")
      return false
    }
	}

  /**
   *  TODO: Manage cases user loses current session or for \
   *  some reason by navite page code navigates to login url.
   *
   *  Possible solution: repeat log-in and navigation steps \
   *  and trigger this method.
   */
  static async #payService(service: ISupportedServices): Promise<void>{
    const method = this.#DATA.paymentMethods.find(x=> x!.uuid === this.#DATA.serviceFields[service]?.aliasRef)!
    log.info(`Pagando ${service}..`)
    try {
      const current = this.#CURRENT_WEBS.get(service)!
      const res = await StepsToPay[service](current.page, method)

      if(res === null) log.success(`¡${picocolors.underline(service)} pagado correctamente!`)
      else log.error(`No se ha podido pagar ${picocolors.underline(service)}, razón: \n${res}`)

    } catch (error) {
      return this.#exceptionTermination(error)
    }
  }

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

	static async #exceptionTermination(e: unknown) {
    await this.#closeWeb()
		cancel(
			`Ha ocurrido un error no manejado en el [Step ${this.#STEP}]: \n${(e as Error).message}`,
		);
		return exit(0);
	}
  static async #outroTermination(){
    await this.#closeWeb()
    outro(
      picocolors.green(
        "✨ Gracias por utilizar esta herramienta, considera hacer un aporte \nañadiendo servicios o donando para que sigamos creciendo :]",
      ),
    );
   return exit(0);
  }

  static async #closeWeb(){
    if(this.#CTX) await this.#CTX.close()
    if(this.#BROWSER) await this.#BROWSER.close()
  }
}

await Sequence.initialize()
