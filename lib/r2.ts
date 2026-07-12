import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/lib/env'

let r2Client: S3Client | null = null

function client() {
  if (r2Client) return r2Client
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 is not configured')
  }

  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  })
  return r2Client
}

export async function presignUpload(
  key: string,
  contentType: string,
  size: number,
  expiresIn = 120,
) {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  })
  return getSignedUrl(client(), command, { expiresIn })
}

export function publicUrl(key: string) {
  return env.R2_PUBLIC_BASE_URL
    ? `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`
    : null
}
