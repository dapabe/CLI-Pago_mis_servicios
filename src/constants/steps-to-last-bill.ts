import { DesignError } from '@/utils/errors/design.error';
import { normalizeNumber } from '@/utils/random';
import { Page } from '@playwright/test';
import { ISupportedServices, SupportedServices } from './services';

export type BillData = {
  bill: number;
  expireDate: string
  paid: boolean
}

type Opts = (page:Page)=> Promise<BillData | string>

/**
 * 	## Please read and check options
 *
 *  The best way to get bills is to store the dashboard url \
 *  go to the bills page explicically or follow steps.
 *
 *  Either way, every service has a specific way to do it.
 *
 *  ## Tips
 *  - Transform bill amount with *normalizeNumber()*
 *  - Every `expireDate` must be the string representation of a Date.
 *
 *  ## Keep in mind
 *  - Current page URL is the user dashboard.
 *  - Returned data from `Promise.allSettled` has to be the same order as `BillData` type.
 *  - The data is dynamic thus it can or will be changed.
 *  - If none of the selectors were found, asume the design has changed.
 *  - Some service pages are more consistent to display last bill than others, \
 *  them will either display the last paid bill but not the pay button if said \
 *  service is already paid.
 *  - Upon paying every page has a different feedback method, for example they \
 *  will either redirect or show a popup. See `Telecentro`
 *  - If returned data is `typeof string` then is the error reason.
 *
 *
 */
export const StepsToLastBill:  Record<ISupportedServices,Opts> = {
  [SupportedServices.enum.Aysa]: async page => {
    const steps = ["#__button3-container-ovPortal---home--idList-2-content"]


    return {
      bill: 0,
      paid: false,
      expireDate: "hoy"
    }
  },
  [SupportedServices.enum.Edesur]: async page => {
    try {
        const res = await Promise.all([
          getLocatorText(page)(".font-size-18px-to-rem.mb-0.text-align-center.text-align-end"),
          getLocatorText(page)(".font-size-18px-to-rem.mb-0.text-align-start"),
          getDisabledPayBtn(page)("#dropdownMenuButton")
        ])

        if(res.every(x=> x === null)) throw new DesignError()


        if(!res[0] || !res[1] || res[2] === null){
          throw new DesignError()
        }

        const bill = parseFloat(normalizeNumber(res[0] ?? "0"))


        return {
          bill,
          expireDate: res[1],
          paid: res[2],
        }
    } catch (e) {
      return (e as Error).message
    }
  },
  [SupportedServices.enum.Telecentro]: async(page)=>{
    try {
      const bills_page = "https://telecentro.com.ar/sucursal-virtual/facturacion"
      await page.goto(bills_page)

      const res = await Promise.all([
        getLocatorText(page)(".hidden .flex.flex-col .text-3xl.font-light"),
        getLocatorText(page)(".hidden .flex.flex-col .text-font-primary-400.text-base.font-light"),
        getDisabledPayBtn(page)(".hidden button[type=button]")
      ])
      console.log(res)

      if(res.every(x=> x === null)) throw new DesignError()

      //  Paid btn wont display if has already paid, but the bill amount will.
      if(!res[0] && res[1] === null || !res[2]) {
        throw new DesignError()
      }

      const bill = parseFloat(normalizeNumber(res[0] ?? "0"))
      const expireDate = res[1]!.split(" ")[1]
      const paid = res[2] === null || bill === 0

      return {
        bill,
        expireDate,
        paid,
      }
    } catch (e) {
      return (e as Error).message
    }
  },
};


const getLocatorText = (page: Page) => async (selector: string)=>{
  const el = page.locator(selector).first()
  return await el.innerText().catch(()=> null)
}

const getDisabledPayBtn = (page: Page) => async (selector: string)=>{
  try {
    const btn = page.locator(selector).first()
    await btn.waitFor()
    return await btn.isDisabled()
  } catch (_) {
    console.log(_)
   return null
  }
}
