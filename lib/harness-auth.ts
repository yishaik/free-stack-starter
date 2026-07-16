import { timingSafeEqual } from 'node:crypto'

export function hasHarnessAccess(expected: string | undefined, authorization: string | null) {
  if (!expected || expected.length < 24 || !authorization?.startsWith('Bearer ')) return false

  const supplied = authorization.slice('Bearer '.length)
  const expectedBytes = Buffer.from(expected)
  const suppliedBytes = Buffer.from(supplied)

  if (expectedBytes.length !== suppliedBytes.length) return false
  return timingSafeEqual(expectedBytes, suppliedBytes)
}
