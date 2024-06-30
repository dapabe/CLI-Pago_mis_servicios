/* eslint-disable camelcase */
import { EncryptedDataSchema } from '@/schemas/encryptedData.schema';
import { StoredPaymentMethodSchema } from '@/schemas/paymentMethod.schema';
import { ServiceLoginFieldsSchema } from '@/schemas/serviceLoginField.schema';
import { UserDataSchema } from '@/schemas/userData.schema';
import { UserServiceFieldSchema } from '@/schemas/userServiceField.schema';
import { z } from 'zod';

export type ILastVersionRelease = '0.0.1';

/**
 *  Last recorded version of changes for each \
 *  schema.
 */
export type ILastSchemaRelease = {
  EncryptedData: '0.0.0';
  StoredPaymentMethod: '0.0.0';
  ServiceLoginFields: '0.0.1';
  UserData: '0.0.1';
  UserServiceField: '0.0.1';
};

export type IValidVersionKeys<T> = Extract<
  keyof T,
  `${number}.${number}.${number}`
>;

/**
 * Encrypted application data.
 */
export type IEncryptedData<
  V extends IValidVersionKeys<
    typeof EncryptedDataSchema
  > = ILastSchemaRelease['EncryptedData'],
> = z.TypeOf<(typeof EncryptedDataSchema)[V]>;

/**
 * User sensitive information.
 */
export type IUserData<
  V extends IValidVersionKeys<
    typeof UserDataSchema
  > = ILastSchemaRelease['UserData'],
> = z.TypeOf<(typeof UserDataSchema)[V]>;

/**
 * User sensitive information data structure.
 */
export type IUserServicesFields<
  V extends IValidVersionKeys<
    typeof UserServiceFieldSchema
  > = ILastSchemaRelease['UserServiceField'],
> = z.TypeOf<(typeof UserServiceFieldSchema)[V]>;

/**
 * Generic login fields to services.
 */
export type IServiceLoginFields<
  V extends IValidVersionKeys<
    typeof ServiceLoginFieldsSchema
  > = ILastSchemaRelease['ServiceLoginFields'],
> = z.TypeOf<(typeof ServiceLoginFieldsSchema)[V]>;

/**
 * Credit/debit card data structure.
 */
export type IStoredPaymentMethod<
  V extends IValidVersionKeys<
    typeof StoredPaymentMethodSchema
  > = ILastSchemaRelease['StoredPaymentMethod'],
> = z.TypeOf<(typeof StoredPaymentMethodSchema)[V]>;

type IValidVersionKeys<T> = Extract<keyof T, `${number}.${number}.${number}`>;

// class Base<Instance> {
//   LAST_VER: IValidVersionKeys<Instance>;
//   constructor(last_ver: IValidVersionKeys<Instance>) {
//     this.#LAST_VER = last_ver;
//   }

//   getLastSchema() {
//     return null as Instance[typeof this.LAST_VER];
//   }

//   getLastVersion() {
//     return this.#LAST_VER;
//   }
// }
// //  El eslint no me dejaba antes pasar el child por que "no se puede usar antes de definirse", cuando en realidad funciona
// class Child extends Base<typeof Child> {
//   constructor() {
//     // Manualmente decirle a la clase padre que esta es la ultima version
//     // Antes tenia una array en la clase padre que devolvia el ultimo esquema como un `array.at(-1)`
//     // Pero esto no estaba tipado fuertemente simplemente devolvia un `z.ZodType` generico
//     super('0.0.1');
//   }

//   '0.0.0' = null;
//   '0.0.1' = null;
// }
// const Manager = new Child();
// Manager.getLastSchema();
