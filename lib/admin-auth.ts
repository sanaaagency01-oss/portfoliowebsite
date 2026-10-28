export const ADMIN_COOKIE_NAME = 'baysaass_admin_session'
export const DEFAULT_ADMIN_PASSWORD = 'baysaass2026!'

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
}

export function getAdminSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'baysaass_studio_os_secure_salt_2026'
}

/**
 * Computes a SHA-256 session token using the standard Web Crypto API.
 * Compatible with Node.js 20+, Edge Runtime, and browser.
 */
export async function computeSessionHash(password: string): Promise<string> {
  const secret = getAdminSecret()
  const text = `${password}:${secret}`
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verifies if the provided password matches the configured admin password.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false
  const expected = getAdminPassword()
  return password.trim() === expected.trim()
}

/**
 * Verifies if the provided session token matches the expected hash.
 */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  try {
    const expectedHash = await computeSessionHash(getAdminPassword())
    return token === expectedHash
  } catch (e) {
    console.error('Failed verifying admin session token', e)
    return false
  }
}
