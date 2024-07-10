import { Page } from '@playwright/test';
import { ServicePages } from './service-pages';
import { ISupportedServices, SupportedServices } from './services';

type Opts = (page:Page)=> Promise<Page | null>

/**
 * 	For sequential steps to enter login page. \
 * 	Some pages dont need this.
 */
export const StepsToLogin: Record<ISupportedServices,Opts> = {
  [SupportedServices.enum.Aysa]: async(page)=> {
    try {
      //  https://github.com/microsoft/playwright/issues/27406#issuecomment-1745273458
      //  Redirecting from URL A to URL B causes race condition.
      //  Solution: Wait for something URL B to be visible, then proceed.
      //  Not working due to many redirects
      await page.goto(ServicePages.Aysa)

      // const promisedURL = page.waitForURL()

      const btn1 = await page.waitForSelector('#__link1',{state:"visible"})
        .catch(()=> {throw new Error()})
      btn1.click()

      const btn2 = await page.waitForSelector('#__button13',{state:"visible"})
        .catch(()=> {throw new Error()})
      btn2.click()


      return page
    } catch (error) {
      console.log({error})
      return null
    }
  },
    [SupportedServices.enum.Edesur]: async(page)=>{
      try {
        await page.goto(ServicePages.Edesur,{waitUntil:"domcontentloaded"});
        await page.waitForLoadState()

        return page
      } catch (error) {
        console.log({error})
        return null
      }
    },
    [SupportedServices.enum.Telecentro]: async(page)=>{
      try {
        await page.goto(ServicePages.Telecentro,{waitUntil:"domcontentloaded"});
        await page.waitForLoadState()

        return page
      } catch (error) {
        console.log({error})
        return null
      }
    }
} as const;


