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
    loginEndpoint: "https://ed.edesur.com.ar/api/Usuario/Login"
  },
  [SupportedServices.enum.Telecentro]: {
    username: 'input[type=email]',
    password: 'input[type=password]',
    submit: 'button[type=submit]',
    loginEndpoint: "https://acceso.web.aysa.com.ar/saml2/idp/sso/acceso.web.aysa.com.ar",
    // https://authn.br1.hana.ondemand.com/saml2/sp/acs/mfy5t4t2rj/mfy5t4t2rj
  },
} as const;
