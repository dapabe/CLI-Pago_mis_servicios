import { IStoredPaymentMethod } from '@/schemas/paymentMethod.schema';
import { log } from '@clack/prompts';
import { Page } from '@playwright/test';
import { PayFields } from './pay-fields';
import { ISupportedServices, SupportedServices } from './services';

type Opts = (page: Page, data: IStoredPaymentMethod)=> Promise<boolean>


export const StepsToPay: Record<ISupportedServices,Opts> = {
  [SupportedServices.enum.Aysa]: async(page)=>{

    return false
  },
  [SupportedServices.enum.Edesur]: async(page)=>{
    return false
  },
  [SupportedServices.enum.Telecentro]: async(page, data)=>{
    try {
        const payPage = "https://telecentro.com.ar/sucursal-virtual/facturacion/pagar"

        await page.goto(payPage)
        await page.waitForLoadState()

        const link = page.getByText(" Tarjeta crédito / débito ")
        await link.waitFor()
        await link.click()

        await page.waitForURL("https://live.decidir.com/web/forms/**")

        const cardNumber = page.locator(PayFields.Telecentro.frontNumber)
        await cardNumber.waitFor()
        await cardNumber.fill(data.frontNumber)

        const expireDate = page.locator(PayFields.Telecentro.expireDate)
        await expireDate.waitFor()
        await expireDate.fill(data.expireDate)

        const cardHolder = page.locator(PayFields.Telecentro.fullName)
        await cardHolder.waitFor()
        await cardHolder.fill(data.fullName)

        const securityNumber = page.locator(PayFields.Telecentro.backNumber)
        await securityNumber.waitFor()
        await securityNumber.fill(data.backNumber.split("/").join(""))

        const submit = page.locator(PayFields.Telecentro.submit)
        await submit.waitFor()
        await submit.click()

        /**
         *  This first time i tried it i submited the form manually by accident so
         *  i could not try this, in practice the next promise should enter the catch
         *  if `status != APROBADO`
         */
        await page.waitForURL("https://telecentro.com.ar/?status=APROBADO")

        return true
      } catch (error) {
        log.error(`error ${JSON.stringify(error)}`)
        return false
      }
    },
  };
