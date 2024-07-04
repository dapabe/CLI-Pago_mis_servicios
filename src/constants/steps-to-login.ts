import { Page } from '@playwright/test';
import { ISupportedServices } from './services';

type Opts = (page:Page)=> Promise<Page | null>

/**
 * 	For sequential steps to enter login page. \
 * 	Some pages dont need this.
 */
export const StepsToLogin: Partial<Record<ISupportedServices,Opts>> = {
  // [SupportedServices.enum.Aysa]: async(page)=> {
  //   try {
  //     //  https://github.com/microsoft/playwright/issues/27406#issuecomment-1745273458
  //     //  Redirecting from URL A to URL B causes race condition.
  //     //  Solution: Wait for something URL B to be visible, then proceed.
  //     //  Not working due to many redirects
  //     await page.goto("https://oficinavirtual.web.aysa.com.ar/auth/index.html?#Accesos/",{timeout:50000,waitUntil:"domcontentloaded"})
  //     await page.waitForSelector("#ids-heading-1")

  //     await expect(page.getByText("Iniciar sesión")).toBeVisible()

  //     return page
  //   } catch (error) {
  //     log.error(`Aysa: ${JSON.stringify(error,null,2)}`)
  //     return null
  //   }
  // },
} as const;


