import { Page } from '@playwright/test';
import { ISupportedServices, SupportedServices } from './services';

type Opts = {
  username: string;
  password: string;
  submit: string;
  loginEndpoint: string
  // failedLogin: (page:Page)=> Promise<boolean>
}

/**
 * 	This constant has to be changed manually if for some reason \
 * 	the login form changes.
 *
 *  `failedLogin` will check if the error box has an error, if so \
 *  it will return **false**.
 */
export const LoginFields: Record<ISupportedServices,Opts> = {
  [SupportedServices.enum.Aysa]: {
    username: '#j_username',
    password: '#j_password',
    submit: '#logOnFormSubmit',
    loginEndpoint: "https://apiext.telecentro.net.ar/sv/api/autenticar"
  },
  [SupportedServices.enum.Edesur]: {
    username: '.show-smart-phone input[type=email]',
    password: 'input[type=password]',
    submit: 'form button',
    loginEndpoint: ""
  },
  [SupportedServices.enum.Telecentro]: {
    username: 'input[type=email]',
    password: 'input[type=password]',
    submit: 'button[type=submit]',
    loginEndpoint: "",
  },
} as const;

async function checkAysa(page:Page){
  const id = "#globalMessages"
  const box = page.locator(id)
  box.waitFor()
  const els = await box.all()
  console.log(els)
  return Boolean(els.length)
}

async function checkEdesur(page:Page){
  return false
}

async function checkTelecentro(page:Page) {
  return false
}
