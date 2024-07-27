import picocolors from "picocolors";
import { BaseError } from "./base.error";
import { AppPackage } from "#/constants/random";

export class ApiError extends BaseError {
  constructor() {
    super()
    this.message = `Contacte a quien corresponda en ${picocolors.underline(AppPackage.repository.url)}`
  }
}