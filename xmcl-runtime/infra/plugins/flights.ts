import { LauncherAppPlugin } from '~/app'
import { kFlights } from '../flights'

const BUILTIN_FLIGHTS = {
}

export const DEVELOPMENT_XMCL_BILLING_API_BASE_URL = 'https://api-staging.xmcl.app'

export function applyDevelopmentApiFlight(
  flights: Record<string, any>,
  environment = process.env.NODE_ENV,
) {
  if (environment === 'development') {
    flights.xmclBillingApiBaseUrl = DEVELOPMENT_XMCL_BILLING_API_BASE_URL
  }
  return flights
}

export function applyRemoteFlights(
  flights: Record<string, any>,
  remote: Record<string, any>,
  environment = process.env.NODE_ENV,
) {
  Object.assign(flights, remote)
  const persisted = { ...flights }
  if (
    environment === 'development' &&
    !Object.hasOwn(remote, 'xmclBillingApiBaseUrl') &&
    persisted.xmclBillingApiBaseUrl === DEVELOPMENT_XMCL_BILLING_API_BASE_URL
  ) {
    delete persisted.xmclBillingApiBaseUrl
  }
  applyDevelopmentApiFlight(flights, environment)
  return persisted
}

export const pluginFlights: LauncherAppPlugin = (app) => {
  const flights = { ...BUILTIN_FLIGHTS, builtinAgent: false, xmclCloud: false }
  app.registry.register(kFlights, flights)
  app.protocol.registerHandler('http', ({ request, response }) => {
    if (request.url.host === 'launcher' && request.url.pathname === '/flights') {
      response.status = 200
      response.headers = { 'content-type': 'application/javascript' }
      response.body = `window.flights = ${JSON.stringify(flights)}`
    }
  })
}
