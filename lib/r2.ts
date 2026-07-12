import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2 is S3-compatible with ZERO egress fees — the reason this stack
// scales to thousands of users for free. Uploads go straight from the browser to
// R2 via a short-lived presigned PUT URL, so large files never touch your server.

let _client: S3Client | null = null
function client() {
  if (_client) return _client
  const account = process.env.R2_ACCOUNT_ID
  if (!account) throw new Error('R2_ACCOUNT_ID is not set')
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${account}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
  return _client
}

const BUCKET = process.env.R2_BUCKET || 'uploads'

// a short-lived URL the browser can PUT a file to directly
export async function presignUpload(key: string, contentType: string, expiresIn = 300) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType })
  return getSignedUrl(client(), cmd, { expiresIn })
}

// the public read URL, if you've bound a custom domain to the bucket
export function publicUrl(key: string) {
  const base = process.env.R2_PUBLIC_BASE_URL
  return base ? `${base.replace(/\/$/, '')}/${key}` : null
}
