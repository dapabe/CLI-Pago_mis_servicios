import { Page } from '@playwright/test';
import { ISupportedServices, SupportedServices } from './services';

type Opts = (page:Page)=> Promise<void>


export const StepsToPay: Record<ISupportedServices,Opts> = {
  [SupportedServices.enum.Aysa]: async(page)=>{},
  [SupportedServices.enum.Edesur]: async(page)=>{},
  [SupportedServices.enum.Telecentro]: async(page)=>{
    const payPage = "https://telecentro.com.ar/sucursal-virtual/facturacion/pagar"

    await page.goto(payPage)
    await page.waitForLoadState()


  },
};
