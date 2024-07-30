export const TABLE_NAMES = {
  serviceNames: "service_names",
  servicesOnRevision: "services_on_revision"
} as const


const createTestTables = () => {

  const temp = {} as typeof TABLE_NAMES

  for (const [key, value] of Object.entries(TABLE_NAMES)) {
    temp[key] = `TEST-${value}`
  }

  return temp
}

export const TEST_TABLE_NAMES = createTestTables()