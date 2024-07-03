import { Page } from '@playwright/test';
import { ISupportedServices, SupportedServices } from './services';

type T = {
  bill: string | null;
  paid: boolean
  expireDate: string
}

type Opts = (page:Page)=> Promise<T>

/**
 * 	Check options.
 *
 *  The best way to get bills is to store the dashboard url \
 *  go to the bills page explicically or follow steps.
 *
 *  Either way, every service has a specific way to do it.
 */
export const StepsToLastBill:  Record<ISupportedServices,Opts> = {
  [SupportedServices.enum.Aysa]: getBillAysa,
  [SupportedServices.enum.Edesur]: getBillEdesur,
  [SupportedServices.enum.Telecentro]: getBillTelecentro,
};

async function getBillAysa(page:Page): Promise<T>{
  const steps = ["#__button3-container-ovPortal---home--idList-2-content"]


  return {
    bill: null,
    paid: false,
    expireDate: "hoy"
  }
}

async function getBillEdesur(page:Page): Promise<T>{
  const bills_page = "https://ov.edesur.com.ar/pagos-y-facturas"
  await page.goto(bills_page)

  const bill = page.locator(".d-flex.justify-content-between.ng-star-inserted .font-size-18px-to-rem.mb-0.text-align-center.text-align-end")
  await bill.waitFor()
  const billText = await bill.innerText()

  const expireDate = page.locator(".font-size-18px-to-rem.mb-0.text-align-start")
  await expireDate.waitFor()
  const expireDateText = await expireDate.innerText()

  const payBtn = page.locator("#dropdownMenuButton")
  await payBtn.waitFor()
  const isPaid = await payBtn.isDisabled()

  return {
    bill: billText,
    paid: isPaid,
    expireDate: expireDateText
  }
}

async function getBillTelecentro(page:Page): Promise<T>{
  const bills_page = "https://telecentro.com.ar/sucursal-virtual/facturacion/facturas"
  await page.goto(bills_page)




  return {
    bill: null,
    paid: false,
    expireDate: "hoy"
  }
}
