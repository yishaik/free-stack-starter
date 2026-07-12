import { Resend } from 'resend'

// Transactional email via Resend (free: ~3,000/mo). Lazily constructed so the app
// builds/runs without a key until you actually send.
export function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const resend = getResend()
  return resend.emails.send({
    from: EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
}
