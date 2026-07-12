import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { presignUpload, publicUrl } from '@/lib/r2'

// Returns a short-lived presigned PUT URL for a browser upload to R2.
// Auth-gated: only signed-in users can request one, and the key is namespaced by
// user id so uploads can't collide or be guessed.
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { filename?: string; contentType?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const safeName = String(body.filename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const key = `${user.id}/${Date.now()}-${safeName}`
  const contentType = String(body.contentType || 'application/octet-stream')

  try {
    const uploadUrl = await presignUpload(key, contentType)
    return NextResponse.json({ uploadUrl, key, publicUrl: publicUrl(key) })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'presign failed' }, { status: 500 })
  }
}
