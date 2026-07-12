import { NextRequest, NextResponse } from 'next/server'
import { getService } from '@/lib/services'
import { runCredentialTest } from '@/lib/test-runner'

export const runtime='nodejs'
export const dynamic='force-dynamic'
const MAX_BODY_BYTES=8192, WINDOW_MS=60000, MAX_REQUESTS=12
const buckets=new Map<string,{count:number;resetAt:number}>()
function ip(request:NextRequest){return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown'}
function limited(key:string){const now=Date.now(),current=buckets.get(key);if(!current||current.resetAt<=now){buckets.set(key,{count:1,resetAt:now+WINDOW_MS});return false}current.count++;return current.count>MAX_REQUESTS}
function json(body:unknown,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store, max-age=0','X-Content-Type-Options':'nosniff'}})}
export async function POST(request:NextRequest){
  if(Number(request.headers.get('content-length')||0)>MAX_BODY_BYTES) return json({error:'Request is too large.'},413)
  if(limited(ip(request))) return json({error:'Too many tests. Try again in one minute.'},429)
  let body:unknown
  try{body=await request.json()}catch{return json({error:'Invalid JSON body.'},400)}
  if(!body||typeof body!=='object') return json({error:'Invalid request.'},400)
  const {serviceId,token}=body as {serviceId?:unknown;token?:unknown}
  if(typeof serviceId!=='string'||typeof token!=='string') return json({error:'Invalid request.'},400)
  const service=getService(serviceId)
  if(!service) return json({error:'Unknown service.'},400)
  if(!service.testerId) return json({status:'format-only',message:'This service does not use a conventional API key. Follow its setup documentation.'})
  try{return json(await runCredentialTest(service.testerId,token))}
  catch(error){return json({error:error instanceof Error?error.message:'Unable to validate credential.'},400)}
}
