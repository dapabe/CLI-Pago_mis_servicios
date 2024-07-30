

export type IAppInitFlags = {
  /**
   *  If not defined server will only log to the console, else \
   *  will save all incoming request to `{desiredPath}/server.log`, \
   *  relative to app directory.
   * 
   *  @default undefined
   */
  loggerPath?: string
}
