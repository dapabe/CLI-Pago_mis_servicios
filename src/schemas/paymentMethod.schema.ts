import { CardBrand, CardType } from '@/constants/card';
import { IValidVersions, SchemaUtilities, ZodSchemaManager } from '@/utils/ZodSchemaManager';
import { TranslatedInput } from '@/utils/translation';
import { z } from 'zod';


export class StoredPaymentMethodSchema  extends ZodSchemaManager<"0.0.0",typeof StoredPaymentMethodSchema> implements SchemaUtilities {
  static "0.0.0" = z.object({
    fullName: z.string().trim().min(1, 'El nombre no puede estar vacio.'),
    frontNumber: z.string().refine((val) => /^\d{14,16}$/.test(val), {
      message: `${TranslatedInput.frontNumber} tiene que ser un digito entre 14-16.`,
    }),
    expireDate: z
      .string()
      .refine((val) => /^(0[1-9]|1[0-2])\/\d{2,4}$/.test(val), {
        message: `${TranslatedInput.expireDate} debe estar formato MM/YY o MM/YYYY.`,
      }),
    backNumber: z.string().refine((val) => /^\d{3,4}$/.test(val), {
      message: `${TranslatedInput.backNumber} tiene que ser un numero de 3-4 digitos.`,
    }),
    cardType: CardType.default("Débito"),
    cardBrand: CardBrand.nullable().default(null),
    payAlias: z.string().trim().min(1, 'El Alias no puede estar vacio.'),
    uuid: z.string().uuid().default(crypto.randomUUID())
  });

  constructor(){
    super(StoredPaymentMethodSchema)
  }


  getLastSchema() {
    return StoredPaymentMethodSchema[this.getLastVersion()]
  }
}

export const StoredPaymentMethodManager = new StoredPaymentMethodSchema()

/**
 * Credit/debit card data structure.
 */
type T = typeof StoredPaymentMethodSchema

export type IStoredPaymentMethod<
  V extends IValidVersions<
    T
  > = "0.0.0",
> = z.TypeOf<(T)[V]>;
