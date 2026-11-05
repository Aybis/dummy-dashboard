import { Configuration, FrontendApi } from '@ory/client'
import { KRATOS_URL } from './config.ts'

/** withCredentials is essential: the Kratos session lives in a cookie. */
export const ory = new FrontendApi(
  new Configuration({ basePath: KRATOS_URL, baseOptions: { withCredentials: true } }),
)

export function httpStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status
}

export function httpData<T = unknown>(err: unknown): T | undefined {
  return (err as { response?: { data?: T } })?.response?.data
}

export function errorText(err: unknown): string {
  const d = httpData<{ error?: { message?: string; reason?: string } }>(err)
  return d?.error?.reason ?? d?.error?.message ?? (err as Error)?.message ?? 'Unknown error'
}
