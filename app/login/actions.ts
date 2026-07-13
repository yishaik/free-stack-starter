'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { safeRedirectPath } from '@/lib/safe-redirect'
import { authCallbackUrl } from '@/lib/site-url'
import { createClient } from '@/lib/supabase/server'

function safeNext(formData: FormData) {
  return safeRedirectPath(formData.get('next'))
}

function loginUrl(params: Record<string, string>) {
  const search = new URLSearchParams(params)
  return `/login?${search.toString()}`
}

export async function login(formData: FormData) {
  const next = safeNext(formData)
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  })
  if (error) redirect(loginUrl({ error: error.message, next }))
  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signup(formData: FormData) {
  const next = safeNext(formData)
  const supabase = await createClient()
  // Point the confirmation email at this deployment's own origin (from env), so the
  // link is never localhost in Production/Preview. In local dev `emailRedirectTo` is
  // omitted, leaving Supabase's default behavior unchanged.
  const emailRedirectTo = authCallbackUrl(next) ?? undefined
  const { error } = await supabase.auth.signUp({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
  })
  if (error) redirect(loginUrl({ error: error.message, next }))
  redirect(loginUrl({ message: 'Check your email to confirm your account, then log in.', next }))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
