'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function safeNext(formData: FormData) {
  const candidate = String(formData.get('next') || '')
  return candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/dashboard'
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
  const { error } = await supabase.auth.signUp({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
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
