import { Page } from '@playwright/test';
import { ISupportedServices, SupportedServices } from './services';

type Opts = (page:Page)=> Promise<Page |null>

/**
 * 	For sequential steps to enter login page. \
 * 	Some pages dont need this.
 */
export const StepsToLogin: Partial<Record<ISupportedServices,Opts>> = {
  [SupportedServices.enum.Aysa]: async(page)=> {
    try {
      const steps = ['#__link1', '#__button13']
      for (const step of steps) {
        const element = page.locator(step);
        await element.waitFor();
        await element.click();
      }

      const loginURL = "https://acceso.web.aysa.com.ar/saml2/idp/sso/acceso.web.aysa.com.ar"
      await page.waitForURL(loginURL, {waitUntil:"domcontentloaded"})

      return page
    } catch (error) {
      console.log(error)
      return null
    }
  },
} as const;


