

export class BaseError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
    Error.captureStackTrace(this)
  }
}