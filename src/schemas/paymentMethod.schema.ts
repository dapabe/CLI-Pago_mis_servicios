import { z } from 'zod';

export const PaymentMethodSchema = z.object({
  // type: z.enum(["Visa","MasterCard"]),
  fullname: z.string(),
  number: z.number(),
  expireDate: z.date(),
  backNumber: z.number(),
});

export type IPaymentMethod = z.TypeOf<typeof PaymentMethodSchema>;
