import { z } from 'zod'
import { env } from '@/lib/env'

export const ALLOWED_UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
] as const

export const uploadRequestSchema = z.object({
  filename: z.string().trim().min(1).max(160),
  contentType: z.enum(ALLOWED_UPLOAD_TYPES),
  size: z.number().int().positive().max(env.UPLOAD_MAX_BYTES),
})

export function safeObjectName(filename: string) {
  const extension = filename.includes('.') ? `.${filename.split('.').pop()}` : ''
  return `${crypto.randomUUID()}${extension.toLowerCase().replace(/[^.a-z0-9]/g, '')}`
}
