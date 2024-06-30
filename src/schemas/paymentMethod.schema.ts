import { CardBrand, CardType } from '@/constants/card';
import { TranslatedInput } from '@/utils/translation';
import { z } from 'zod';

export class StoredPaymentMethodSchema {
  static '0.0.1' = z.object({
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
    cardType: CardType,
    cardBrand: CardBrand.nullable().default(null),
    payAlias: z.string().trim().min(1, 'El Alias no puede estar vacio.'),
  });

  static getLastSchema() {
    return this['0.0.1'];
  }
}
