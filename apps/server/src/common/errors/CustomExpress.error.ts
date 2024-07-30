
export class CustomExpressError extends Error {
  /**
   *  Http status
   */
  public status: number;
  /**
   *  Http status text
   */
  public statusText: string;
  /**
   *  Error data
   */
  public details: string
  constructor(status: number, statusText: string, details: string) {
    super()
    this.name = this.constructor.name;
    this.status = status;
    this.statusText = statusText;
    this.details = details
    Error.captureStackTrace(this)
  }
}