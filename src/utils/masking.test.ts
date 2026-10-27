import { describe, it, expect } from 'vitest'
import { maskEmail, maskPhone } from './masking'

describe('Privacy contact masking utilities', () => {
  it('masks standard email addresses correctly', () => {
    expect(maskEmail('maya.lin@example.com')).toBe('m***n@example.com')
    expect(maskEmail('elena.rostova@wellness.de')).toBe('e***a@wellness.de')
  })

  it('handles short or malformed email addresses', () => {
    expect(maskEmail('ab@test.com')).toBe('a***@test.com')
    expect(maskEmail('invalid-string')).toBe('***@***.com')
  })

  it('masks phone numbers preserving country prefix and last four digits', () => {
    expect(maskPhone('+1 (555) 234-5678')).toContain('5678')
    expect(maskPhone('+91 98765-43210')).toContain('3210')
  })
})
