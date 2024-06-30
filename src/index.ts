#!/usr/bin/env node
import { cancel, intro, log, note, outro } from '@clack/prompts';
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import isOnline from 'is-online';
import nodeCleanup from 'node-cleanup';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cwd, exit } from 'node:process';
import picocolors from 'picocolors';
import { getDefaultsForSchema } from 'zod-defaults';
import 'zx/globals';
import { LoginFields } from './constants/login-fields';
import { AppPackage, generatedFileName } from './constants/random';
import { ServicePages } from './constants/service-pages';
import { StepsToLastBill } from './constants/steps-to-last-bill';
import { StepsToLogin } from './constants/steps-to-login';
import { StepsToPay } from './constants/steps-to-pay';
import { selectMenuActionPrompt } from './prompts/selectMenuAction.prompt';
import { changePasswordPrompt } from './prompts/startup/changePassword.prompt';
import { decryptPrompt } from './prompts/startup/decrypt.prompt';
import { firstTimePrompt } from './prompts/startup/firstTime.prompt';
import { chooseSupportedServicePrompt } from './prompts/supported-services/chooseSupportedService.prompt';

import { ISupportedServices } from './constants/services';
import { choosePaymentMenuPrompt } from './prompts/payment-methods/choosePaymentMenu.prompt';
import { EncryptedDataSchema } from './schemas/encryptedData.schema';
import { UserDataSchema } from './schemas/userData.schema';
import { IUserData } from './types/releases';
import { encryptData } from './utils/crypto';
import { retrieveFromSelectedFilledForms } from './utils/random';

const startAt = Date.now();
nodeCleanup((exitCode) =>
  console.log(
    exitCode
      ? `${picocolors.red(picocolors.bold('error'))} Command failed with exit code ${exitCode}.`
      : `✨ Done in ${((Date.now() - startAt) / 1000).toFixed(2)}s.`,
  ),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Sequence {
  static #DEBUG_MODE =
    process.argv.includes('--debug') && process.env.NODE_ENV === 'dev';

  static #_STEP = 0;
  static get #STEP() {
    return this.#_STEP;
  }

  static set #STEP(n: number) {
    if (this.#DEBUG_MODE) note(`Step ${n}`, '[DEBUG]');
    this.#_STEP = n;
  }

  static #_DATA: IUserData;
  static get #DATA(): IUserData {
    return this.#_DATA;
  }

  static set #DATA(d: IUserData) {
    if (this.#DEBUG_MODE) note(JSON.stringify(d, null, 2), '[DEBUG]');
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

  static #FIRST_TIME: boolean = false;

  static {
    /**
     * JS auto evaluates static block and calls this private method.
     */
    (async () => await this.#initialize())();
  }

  static async #initialize() {
    intro(picocolors.inverse(` v ${AppPackage.version} `));
    if (this.#DEBUG_MODE) log.warning(picocolors.bgYellow('[DEBUG MODE]'));
    note(
      `Una herramienta moderna para pagar tus \ncuentas de forma segura y automatica.`,
      'CLI-Pago_mis_servicios',
    );
    log.info(`Creado y mantenido por ${picocolors.blue(AppPackage.author)}`);
    log.warning(
      `Si estas teniendo problemas usando la aplicación compartelo \nen: ${AppPackage.repository.url}`,
    );

    await this.#checkFile();
    await this.#waitForUserMenuAction();
    await this.#checkSelectedServices();
    await this.#retrieveBills();
    await this.#waitForActionInBillSelection();
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
      const filePath = path.join(cwd(), generatedFileName);
      const file = await fs.readFile(filePath, 'utf-8');

      const validJson = EncryptedDataSchema.getLastSchema().safeParse(
        JSON.parse(file),
      );
      if (!validJson.success) {
        log.error(
          `Algunos datos del archivo '${generatedFileName}' son invalidos, \n este archivo no debe ser modificado bajo ninguna circunstancia. \n${JSON.stringify(validJson.error.flatten().fieldErrors, null, 2)}`,
        );
        exit(1);
      }
      const { password, userData } = await decryptPrompt(validJson.data);
      this.#DATA = userData;
      this.#PASS = password;

      this.#FIRST_TIME = !retrieveFromSelectedFilledForms(this.#DATA).length;
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
      const filePath = path.join(cwd(), generatedFileName);
      await fs.writeFile(
        filePath,
        JSON.stringify(
          encryptData(
            password,
            getDefaultsForSchema(UserDataSchema.getLastSchema()),
          ),
        ),
      );
    } catch (error) {
      this.exceptionTermination(error);
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
        case 'next':
          // if (this.#FIRST_TIME) return await this.#waitForUserMenuAction();
          return await Promise.resolve();
        case 'serviceFields':
          await chooseSupportedServicePrompt(this.#DATA);
          await this.#update();
          return await this.#waitForUserMenuAction();
        case 'paymentMethods':
          await choosePaymentMenuPrompt(this.#DATA);
          await this.#update();
          return await this.#waitForUserMenuAction();
        case 'password':
          this.#PASS = await changePasswordPrompt(this.#PASS);
          await this.#update();
          return await this.#waitForUserMenuAction();
        default:
          outro(
            picocolors.green(
              '✨ Gracias por utilizar esta herramienta, considera hacer un aporte :)',
            ),
          );
          return exit(0);
      }
    } catch (error) {
      this.exceptionTermination(error);
    }
  }

  /**
   *
   * @description Step 3
   */
  static async #checkSelectedServices(): Promise<void> {
    this.#STEP = 3;
    const currentSelection = retrieveFromSelectedFilledForms(this.#DATA);
    try {
      // const a = await spinner()
      const connection = await isOnline();
      if (!connection) return await this.#waitForUserMenuAction();
      // if (!currentSelection.length)
      //   await Promise.reject();

      const previousLoop = currentSelection.map((x) => ({
        [x]: this.#CURRENT_WEBS.has(x),
      }));
      console.log(previousLoop);
      /**
       * 	When user navigates to selectEditAction from
       * 	waitForUserActionOnContext this should resolve
       * 	only when currentSelection is equal to CURRENT_WEBS
       * 	else should navigate to the new selected webs.
       */
      const isEqualToPreviusLoop = previousLoop.every(Boolean);
      if (isEqualToPreviusLoop || this.#BROWSER) Promise.resolve();

      this.#BROWSER = await chromium.launch({ headless: false });
      this.#CTX = await this.#BROWSER.newContext();

      for await (const selectedWeb of currentSelection) {
        const page = await this.#isPageAvailable(selectedWeb);
        if (!page) break;
        await this.#navigateToDashboard(page, selectedWeb);
        this.#CURRENT_WEBS.set(selectedWeb, { page, dashboard: page.url() });
      }
    } catch (error) {}
  }

  static async #isPageAvailable(
    service: ISupportedServices,
  ): Promise<Page | null> {
    try {
      const page = await this.#CTX!.newPage();
      await page.goto(ServicePages[service]);

      if (StepsToLogin[service] !== undefined) {
        for await (const step of StepsToLogin[service]!) {
          const element = page.locator(step);
          await element.waitFor();
          await element.click();
        }
      }

      return page;
    } catch (error) {
      return null;
    }
  }

  static async #navigateToDashboard(
    page: Page,
    service: ISupportedServices,
  ): Promise<void> {
    const field = LoginFields[service];
    const fieldData = this.#DATA.serviceFields[service]!;

    try {
      const userInput = page.locator(field.username);
      await userInput.waitFor();
      await userInput.fill(fieldData.username);

      const passInput = page.locator(field.password);
      await passInput.waitFor();
      await passInput.fill(fieldData.password);

      const submit = page.locator(field.submit);
      await submit.waitFor();
      await submit.click();

      // spinner.success({ text: `Logeado en '${service}' correctamente.` });
    } catch (error) {
      // spinner.error({
      // 	text: `Ha ocurrido un error al logearse. \n ${JSON.stringify(error)}`,
      // 	mark: ":(",
      // });
      // await this.terminateProgram(1);
    }
  }

  /**
   *  @description Step 4
   */
  static async #retrieveBills() {
    this.#STEP = 4;
  }

  /**
   *  Navigates to the most likely page to have last bill.
   */
  static async #lookForBill(
    service: ISupportedServices,
  ): Promise<string | null> {
    try {
      const { page } = this.#CURRENT_WEBS.get(service)!;
      const tempArr = Object.values(StepsToLastBill[service]!);

      for (let i = 0; i <= tempArr.length; ++i) {
        const element = page.locator(tempArr[i]);
        await element.waitFor();
        if (i === tempArr.length) {
          return await element.innerHTML();
        }
        await element.click();
      }
      return null;
    } catch (_) {
      console.log(_);
      return null;
    }
  }

  /**
   *
   * @description Step 5 - Final
   */
  static async #waitForActionInBillSelection(): Promise<void> {
    this.#STEP = 5;
    // try {
    //   const bills = this.#CURRENT_WEBS
    //   const answer = await chooseBillToPayPrompt(
    //     Object.keys(this.#CURRENT_WEBS) as ISupportedServices[],
    //   );
    //   switch (answer) {
    //     case 'all':
    //       return await this.#waitForActionInBillSelection();
    //     case 'exit':
    //       return await this.#waitForUserMenuAction();
    //     default:
    //       const bill = await this.#lookForBill(answer);
    //       if (bill) log.info(`Monto a pagar: ${bill}`);
    //       else
    //         log.error(
    //           'No se ha podido encontrar el monto a pagar, \n nuestros metodos pueden estar desactualizados, \n pongase en contacto con el autor para mas información.',
    //         );
    //       return await this.#waitForActionInBillSelection();
    //   }
    // } catch (error) {
    //   this.exceptionTermination(error);
    // }
  }

  static async #navigateToPayForm(service: ISupportedServices) {
    try {
      const { page } = this.#CURRENT_WEBS.get(service)!;
      for (const step of Object.values(StepsToPay[service]!)) {
        const element = page.locator(step);
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
      log.info('Datos guardados correctamente.');
    } catch (error) {
      this.exceptionTermination(error);
    }
  }

  static exceptionTermination(e: unknown) {
    cancel(
      `Ha ocurrido un error inesperado en el [Step ${this.#STEP}]: \n${JSON.stringify(e, null, 2)}`,
    );
    exit(0);
  }
}
