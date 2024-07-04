import { Page } from '@playwright/test';
import { ISupportedServices, SupportedServices } from './services';

export type BillData = {
  bill: string;
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
 *  - Every `bill` must be the numeric string representation.
 *  - Every `expireDate` must be the string representation of a Date.
 */
export const StepsToLastBill:  Record<ISupportedServices,Opts> = {
  [SupportedServices.enum.Aysa]: async page => {
    const steps = ["#__button3-container-ovPortal---home--idList-2-content"]


    return {
      bill: "0",
      paid: false,
      expireDate: "hoy"
    }
  },
  [SupportedServices.enum.Edesur]: async page => {
    try {
        const bills_page = "https://ov.edesur.com.ar/pagos-y-facturas"
        await page.goto(bills_page)

        const bill = page.locator(".font-size-18px-to-rem.mb-0.text-align-center.text-align-end").first()
        await bill.waitFor()
        const billText = await bill.innerText()

        const expireDate = page.locator(".font-size-18px-to-rem.mb-0.text-align-start")
        await expireDate.waitFor()
        const expireDateText = await expireDate.innerText()

        const payBtn = page.locator("#dropdownMenuButton")
        await payBtn.waitFor()
        const disabled = await payBtn.isDisabled()

        return {
          bill: billText.split("$")[1],
          paid: disabled === true,
          expireDate: expireDateText
        }
    } catch (error) {
      console.log(error)
      return null
    }
  },
  [SupportedServices.enum.Telecentro]: async(page)=>{
    try {
      const bills_page = "https://telecentro.com.ar/sucursal-virtual/facturacion"
      await page.goto(bills_page)

      const bill = page.locator(".hidden .flex.flex-col .text-3xl.font-light")
      await bill.waitFor()
      const billText = await bill.innerText()

      const expireDate = page.locator(".hidden .flex.flex-col .text-font-primary-400.text-base.font-light")
      await expireDate.waitFor()
      const expireDateText = await expireDate.innerText()

      const payBtn = page.locator(".hidden button[type=button]")
      await payBtn.waitFor()
      const disabled = await payBtn.isDisabled()


      return {
        bill: billText.split(" ")[1],
        paid: disabled === true,
        expireDate: expireDateText.split(" ")[1]
      }
    } catch (error) {
      console.log(error)
      return null
    }
  },
};
