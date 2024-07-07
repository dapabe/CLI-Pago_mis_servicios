import { DesignError } from '@/utils/errors/design.error';
import { log } from '@clack/prompts';
import { Page } from '@playwright/test';
import { ISupportedServices, SupportedServices } from './services';

export type BillData = {
  bill: number;
  paid: boolean
  expireDate: string
}

type Opts = (page:Page)=> Promise<BillData | null>

/**
 * 	Check options.
 *
 *  The best way to get bills is to store the dashboard url \
 *  go to the bills page explicically or follow steps.
 *
 *  Either way, every service has a specific way to do it.
 *
 *  - Every `bill` must be the numeric string representation without dots & float numbers must be ",".
 *  - Every `expireDate` must be the string representation of a Date.
 *
 *  If any of the selectors are not found, asume the designed has changed or \
 *  is an expected behaviour of the dynamic data, on this case custom logic has \
 *  to be implemented, see **Telecentro**.
 *
 *  @example Some services wont display pay button or the bill upon paying.
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
        const bills_page = "https://ov.edesur.com.ar/pagos-y-facturas"
        await page.goto(bills_page)

        const [billAmount, expireText, paidBtn] = await Promise.all([
          getLocatorText(page)(".font-size-18px-to-rem.mb-0.text-align-center.text-align-end"),
          getLocatorText(page)(".font-size-18px-to-rem.mb-0.text-align-start"),
          getDisabledPayBtn(page)("#dropdownMenuButton")
        ])

        if(!billAmount || !expireText || paidBtn === null){
          throw new DesignError()
        }

        const bill = parseFloat(billAmount?.split("$")[1].split(".").join("") ?? "0")


        return {
          bill,
          expireDate: expireText,
          paid: paidBtn,
        }
    } catch (e) {
      log.warning(`Error al obtener monto a pagar [Edesur]: ${(e as Error).message}`)
      return null
    }
  },
  [SupportedServices.enum.Telecentro]: async(page)=>{
    try {
      const bills_page = "https://telecentro.com.ar/sucursal-virtual/facturacion"
      await page.goto(bills_page)

      const [billAmount, expireText, paidBtn] = await Promise.all([
        getLocatorText(page)(".hidden .flex.flex-col .text-3xl.font-light"),
        getLocatorText(page)(".hidden .flex.flex-col .text-font-primary-400.text-base.font-light"),
        getDisabledPayBtn(page)(".hidden button[type=button]")
      ])

      //  Paid btn wont display if has already paid, but the bill amount will.
      if(!billAmount && paidBtn === null || !expireText) {
        throw new DesignError()
      }

      const bill = parseFloat(billAmount?.split(" ")[1] ?? "0")
      const expireDate = expireText.split(" ")[1]
      const paid = paidBtn === true || bill === 0

      return {
        bill,
        expireDate,
        paid,
      }
    } catch (e) {
      log.warning(`Error al obtener monto a pagar [Telecentro]: ${(e as Error).message}`)
      return null
    }
  },
};


const getLocatorText = (page: Page) => async (selector: string)=>{
  const el = page.locator(selector).first()
  return await el.innerText().catch(()=> null)
}

const getDisabledPayBtn = (page: Page) => async (selector: string)=>{
  try {
    const btn = page.locator(selector)
    await btn.waitFor()
    return await btn.isDisabled()
  } catch (_) {
   return null
  }
}
