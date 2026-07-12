import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'

// Sends a transactional email via Resend to the SIGNED-IN user (a safe demo — it
// won't send to arbitrary addresses). Swap the `to` for your real flow (e.g. a
// welcome email triggered on signup).
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const result = await sendEmail({
      to: user.email,
      subject: 'Hello from Free Stack Starter',
      html: `<p>Hi 👋 — this transactional email was sent via <b>Resend</b> from your Next.js app.</p>`,
    })
    return NextResponse.json({ ok: true, id: result.data?.id ?? null })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'send failed' }, { status: 500 })
  }
}
