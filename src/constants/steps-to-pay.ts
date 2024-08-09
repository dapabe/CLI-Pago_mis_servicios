import type { IStoredPaymentMethod } from "@/schemas/paymentMethod.schema";
import { InvalidPayMethodError } from "@/utils/errors/invalid-paymethod.error";
import { conjunctionList } from "@/utils/random";
import picocolors from "picocolors";
import type { Page } from "playwright-core";
import { CardBrand, type ICardBrand } from "./card";
import { PayFields } from "./pay-fields";
import { type ISupportedServices, SupportedServices } from "./services";

type Opts = (page: Page, data: IStoredPaymentMethod) => Promise<null | string>;

export const StepsToPay: Record<ISupportedServices, Opts> = {
	[SupportedServices.enum.Aysa]: async (page) => {
		return null;
	},
	[SupportedServices.enum.Edesur]: async (page, data) => {
		try {
			await page.goto(
				"https://ov.edesur.com.ar/pagos-y-facturas/pagar?typePayment=UF&estado=pagar",
			);
			const availableCards = new Map<ICardBrand, string>([
				[CardBrand.enum.Visa, "[id='31']"],
				[CardBrand.enum.Mastercard, "[id='105']"],
				[CardBrand.enum.Maestro, "[id='106']"],
			]);

			if (data.cardBrand === null) {
				const cards = [...availableCards].map(([x]) => picocolors.underline(x));
				throw new Error(
					`Sin marca de tarjeta, posibles: ${conjunctionList(cards)}`,
				);
			}

			const checkbox = await page.waitForSelector(
				availableCards.get(data.cardBrand)!,
			);
			await checkbox.check();

			const selectMethod = page.locator(
				".card-body button[type=button].btn-light",
			);
			//  Needed, the form validates if the actions are instant, probably
			//  checking bots, hehe
			setTimeout(async () => {
				await selectMethod.click();
			}, 5000);
			const frame = page.frameLocator(".pagos-frame").first().owner();
			const payUrl = await frame.getAttribute("src");

			if (!payUrl)
				throw new Error("No se ha podido encontrar el bloque de pago");
			await page.goto(payUrl);

			const cardNumber = await page.waitForSelector(
				PayFields.Edesur.frontNumber,
			);
			await cardNumber.fill(data.frontNumber);

			const expireDate = await page.waitForSelector(
				PayFields.Edesur.expireDate,
			);
			await expireDate.fill(data.expireDate);

			const cardHolder = await page.waitForSelector(PayFields.Edesur.fullName);
			await cardHolder.fill(data.fullName);

			const securityNumber = await page.waitForSelector(
				PayFields.Edesur.backNumber,
			);
			await securityNumber.fill(data.backNumber.split("/").join(""));

			const submit = await page.waitForSelector(PayFields.Edesur.submit);
			//  form btn is disabled unless an interaction event triggers
			await submit.focus();
			await submit.dblclick();

			await page
				.waitForURL("https://ov.edesur.com.ar/mi-cuenta?pagoPrisma=true")
				.catch(() => {
					throw new InvalidPayMethodError();
				});

			return null;
		} catch (error) {
			return (error as Error).message;
		}
	},
	[SupportedServices.enum.Telecentro]: async (page, data) => {
		try {
			await page.goto(
				"https://telecentro.com.ar/sucursal-virtual/facturacion/pagar",
			);

			const link = page.getByText(" Tarjeta crédito / débito ");
			await link.waitFor();
			await link.click();

			await page.waitForURL("https://live.decidir.com/web/forms/**");

			const cardNumber = page.locator(PayFields.Telecentro.frontNumber);
			await cardNumber.waitFor();
			await cardNumber.fill(data.frontNumber);

			const expireDate = page.locator(PayFields.Telecentro.expireDate);
			await expireDate.waitFor();
			await expireDate.fill(data.expireDate);

			const cardHolder = page.locator(PayFields.Telecentro.fullName);
			await cardHolder.waitFor();
			await cardHolder.fill(data.fullName);

			const securityNumber = page.locator(PayFields.Telecentro.backNumber);
			await securityNumber.waitFor();
			await securityNumber.fill(data.backNumber.split("/").join(""));

			const submit = page.locator(PayFields.Telecentro.submit);
			await submit.waitFor();
			await submit.click();

			/**
			 *  This first time i tried it i submited the form manually by accident so
			 *  i could not try this, in practice the next promise should enter the catch
			 *  if `status != APROBADO`
			 */
			await page
				.waitForURL("https://telecentro.com.ar/?status=APROBADO")
				.catch(() => {
					throw new InvalidPayMethodError();
				});

			return null;
		} catch (error) {
			return (error as Error).message;
		}
	},
};
