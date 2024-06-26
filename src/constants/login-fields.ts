import { SupportedServices } from './services';

/**
 * 	This constant has to be changed manually if for some reason \
 * 	the login form changes.
 */
export const LoginFields = {
  [SupportedServices.enum.Aysa]: {
    username: '#j_username',
    password: '#j_password',
    submit: '#logOnFormSubmit',
  },
  [SupportedServices.enum.Edesur]: {
    username: '.show-smart-phone input[type=email]',
    password: 'input[type=password]',
    submit: 'form button',
  },
  [SupportedServices.enum.Telecentro]: {
    username: 'input[type=email]',
    password: 'input[type=password]',
    submit: 'button[type=submit]',
  },
} as const;
