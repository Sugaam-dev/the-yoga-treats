/**
 * Privacy contact masking utilities for simulated marketplace communication.
 * Masks sensitive guest and host contact information in pre-booking and pre-checkin contexts.
 */

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.com'
  const [localPart, domain] = email.split('@')
  if (localPart.length <= 2) {
    return `${localPart[0] || '*'}***@${domain}`
  }
  const first = localPart[0]
  const last = localPart[localPart.length - 1]
  return `${first}***${last}@${domain}`
}

export function maskPhone(phone: string): string {
  if (!phone) return '+** ***-****'
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return '+** ***-****'
  
  const lastFour = digits.slice(-4)
  const countryCode = phone.startsWith('+') ? phone.split(' ')[0] : '+91'
  return `${countryCode} ***-***${lastFour}`
}
