import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { presignUpload, publicUrl } from '@/lib/r2'
import { apiError, internalError } from '@/lib/api'
import { safeObjectName, uploadRequestSchema } from '@/lib/uploads'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  try {
    const parsed = uploadRequestSchema.safeParse(await req.json())
    if (!parsed.success) return apiError('Invalid upload request', 400, parsed.error.flatten())

    const { filename, contentType, size } = parsed.data
    const key = `${user.id}/${new Date().toISOString().slice(0, 10)}/${safeObjectName(filename)}`
    const uploadUrl = await presignUpload(key, contentType, size)

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl: publicUrl(key),
      expiresIn: 120,
    })
  } catch (error) {
    return internalError(error)
  }
}
