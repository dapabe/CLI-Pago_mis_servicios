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
import { encryptData } from "./utils/crypto";
import { conjunctionList, getServicesWithAllFilledLogins } from "./utils/random";

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
        log.error("Sin servicios al que navegar, volviendo al menú..")
        setTimeout(async()=> await this.#waitForUserMenuAction(), 2000);
        return;
      }


			/**
       *  [WIP]
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
			// if (isEqualToPreviusLoop || this.#BROWSER) return await this.#checkForBills()

			this.#BROWSER = await chromium.launch({ headless: false });
			this.#CTX = await this.#BROWSER.newContext({locale: "es-ES"});
      const invalidateResources = process.env.NODE_ENV === "dev" ? ContextRouteURLs.DEV: ContextRouteURLs.PROD
      this.#CTX.route(invalidateResources, (route)=> route.abort())

      log.info(`Validando que ${currentSelection.length > 1 ? `tus ${currentSelection.length} servicios esten disponibles..` : `tu servicio esté disponible..`} (Iniciando sesión)`)
      log.warn("Esto puede tardar un poco.")
			for await (const { service, fields } of currentSelection) {

        if(ServiceOnRevision[service]) {
          this.#CURRENT_WEBS.set(service, null);
          break
        }

        const page = await this.#isPageAvailable(service);
				if (!page) {
          this.#CURRENT_WEBS.set(service, null);
          break
        }

        const goodResponse = await this.#navigateToDashboard(page, service, fields);
        if(!goodResponse) {
          this.#CURRENT_WEBS.set(service, null);
          break
        };
        this.#CURRENT_WEBS.set(service, { page, dashboard: ServiceDashboards[service] });
			}

      if(!this.#CURRENT_WEBS.size){
        log.warning(`No se hay servicios seleccionados disponibles a los que navegar`)
        setTimeout(async() => await this.#waitForUserMenuAction(), 2000);
        return;
      }

      log.info("Buscando ultima factura.. (Esto puede tardar según la cantidad de servicios)")
      await this.#checkForBills()
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
	static async #checkForBills() {
		this.#STEP = 4;
    try {
      if(!this.#CURRENT_WEBS) throw Error("NO_CURRENT_WEBS")
      const bills = new Map<ISupportedServices,BillData | null>()
      for (const [service, value] of [...this.#CURRENT_WEBS]) {
        if(!value) {
          bills.set(service, value)
          break
        }
        const data = await StepsToLastBill[service](value.page)

        bills.set(service, data)
        if(data) await value.page.goto(value.dashboard)
      }

      await this.#waitForActionInBillSelection(bills)
    } catch (error) {
      return this.#exceptionTermination(error)
    }
	}


	/**
	 *
	 * @description Step 5 - Final
	 */
	static async #waitForActionInBillSelection(currentBills:Map<ISupportedServices,BillData | null>): Promise<void> {
		this.#STEP = 5;
		try {
      const availableBills = [...currentBills].map(([service, bill])=>({service, data:bill, onRevision: ServiceOnRevision[service]}))
      const answer = await chooseBillToPayPrompt(availableBills);
      switch (answer) {
        case 'all':
          const filtered = availableBills.filter(x=> x.data !== null)
          if(!filtered.length) return await this.#waitForActionInBillSelection(currentBills);

          // await this.#payAll()

          return await this.#waitForActionInBillSelection(currentBills);
        case 'exit':
          return await this.#waitForUserMenuAction();
        default:
          const noData = !availableBills.find(x=> x.service === answer)?.data
          if(ServiceOnRevision[answer] || noData) return await this.#waitForActionInBillSelection(currentBills);
          await this.#payService(answer)
          return await this.#waitForActionInBillSelection(currentBills);
        }
		} catch (error) {
		  this.#exceptionTermination(error);
		}
	}

	//  Utilities section

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
    const maxTimeout = 60_000 // 1 min

		try {
			const userInput = page.locator(field.username);
			await userInput.waitFor();
			await userInput.fill(fieldData.username!);

			const passInput = page.locator(field.password);
			await passInput.waitFor();
			await passInput.fill(fieldData.password!);

			const submit = page.locator(field.submit);
			await submit.waitFor();
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
      if(!success) log.warning(`Ha ocurrido un error al iniciar sesión, revise que las \ncredenciales de ${picocolors.underline(service)} sean correctas.`)

      return success
		} catch (error) {
      log.error(`Ha ocurrido un error al ${picocolors.underline("tratar")} de iniciar sesión en ${picocolors.underline(service)}, \nverifique sus credenciales sean correctas o que el servicio ${page.url()} esté disponible.`)
      note(JSON.stringify(error,null,2),"Error detallado")
      return false
    }
	}

  static async #payService(service: ISupportedServices){
    const method = this.#DATA.paymentMethods.find(x=> x!.uuid === this.#DATA.serviceFields[service]?.aliasRef)!
    log.info(`Pagando ${service}..`)
    try {
      const page = this.#CURRENT_WEBS.get(service)!.page
      const res =  await StepsToPay[service](page, method)
      if(res) log.success(`¡${picocolors.underline(service)} pagado con exito!`)
      else log.error(`No se ha podido pagar ${picocolors.underline(service)}, por algún error`)
    } catch (error) {
      return this.#exceptionTermination(error)
    }
  }

  static async #payAll(availableBills: {service:ISupportedServices, data:BillData}[]){
    try {
      log.info(`Pagando ${conjunctionList(availableBills.map(x=> `${picocolors.underline(x.service)}(${x.data.bill})`))}..`)

      // log.success(`¡Pagado ${picocolors.underline("todo")} correctamente!`)
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

	static #exceptionTermination(e: unknown) {
    this.#closeWeb()
		cancel(
			`Ha ocurrido un error inesperado en el [Step ${this.#STEP}]: \n${JSON.stringify(e, null, 2)}`,
		);
		return exit(0);
	}
  static #outroTermination(){
    this.#closeWeb()
    outro(
      picocolors.green(
        "✨ Gracias por utilizar esta herramienta, considera hacer un aporte :)",
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
