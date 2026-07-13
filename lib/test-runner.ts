import 'server-only'
import { LIVE_TESTER_SET } from './live-testers'

export type TestResult = { status: 'valid'|'invalid'|'inconclusive'|'format-only'; message: string; httpStatus?: number; latencyMs?: number }
type Spec = { url: string; init?: RequestInit; valid?: number[] }
const headers = { Accept: 'application/json', 'User-Agent': 'FreeStackStarter-KeyTester/1.0' }
const bearer = (url: string, token: string, prefix='Bearer'): Spec => ({ url, init:{ headers:{...headers, Authorization:`${prefix} ${token}`} } })
const header = (url:string, name:string, token:string):Spec => ({url,init:{headers:{...headers,[name]:token}}})
const q = encodeURIComponent

function request(id:string, token:string):Spec {
  switch(id) {
    case 'vercel': return bearer('https://api.vercel.com/v2/user',token)
    case 'netlify': return bearer('https://api.netlify.com/api/v1/user',token)
    case 'cloudflare': return bearer('https://api.cloudflare.com/client/v4/user/tokens/verify',token)
    case 'github': return {url:'https://api.github.com/user',init:{headers:{...headers,Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'}}}
    case 'gitlab': return header('https://gitlab.com/api/v4/user','PRIVATE-TOKEN',token)
    case 'render': return bearer('https://api.render.com/v1/owners?limit=1',token)
    case 'neon': return bearer('https://console.neon.tech/api/v2/users/me',token)
    case 'clerk': return bearer('https://api.clerk.com/v1/users?limit=1',token)
    case 'workos': return bearer('https://api.workos.com/user_management/users?limit=1',token)
    case 'gemini': return header('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1','x-goog-api-key',token)
    case 'groq': return bearer('https://api.groq.com/openai/v1/models',token)
    case 'openrouter': return bearer('https://openrouter.ai/api/v1/auth/key',token)
    case 'huggingface': return bearer('https://huggingface.co/api/whoami-v2',token)
    case 'mistral': return bearer('https://api.mistral.ai/v1/models',token)
    case 'cohere': return {url:'https://api.cohere.com/v1/check-api-key',init:{method:'POST',headers:{...headers,Authorization:`Bearer ${token}`}}}
    case 'replicate': return bearer('https://api.replicate.com/v1/account',token,'Token')
    case 'together': return bearer('https://api.together.xyz/v1/models',token)
    case 'elevenlabs': return header('https://api.elevenlabs.io/v1/user','xi-api-key',token)
    case 'deepgram': return bearer('https://api.deepgram.com/v1/projects',token,'Token')
    case 'stability': return bearer('https://api.stability.ai/v1/user/account',token)
    case 'fireworks': return bearer('https://api.fireworks.ai/inference/v1/models',token)
    case 'cerebras': return bearer('https://api.cerebras.ai/v1/models',token)
    case 'sambanova': return bearer('https://api.sambanova.ai/v1/models',token)
    case 'assemblyai': return header('https://api.assemblyai.com/v2/account','authorization',token)
    case 'pinecone': return header('https://api.pinecone.io/indexes','Api-Key',token)
    case 'resend': return bearer('https://api.resend.com/api-keys?limit=1',token)
    case 'brevo': return header('https://api.brevo.com/v3/account','api-key',token)
    case 'postmark': return header('https://api.postmarkapp.com/server','X-Postmark-Server-Token',token)
    case 'slack': return {url:'https://slack.com/api/auth.test',init:{method:'POST',headers:{...headers,Authorization:`Bearer ${token}`}}}
    case 'discord': return bearer('https://discord.com/api/v10/users/@me',token,'Bot')
    case 'telegram': return {url:`https://api.telegram.org/bot${q(token)}/getMe`,init:{headers}}
    case 'sentry': return bearer('https://sentry.io/api/0/',token)
    case 'axiom': return bearer('https://api.axiom.co/v1/datasets',token)
    case 'linear': return {url:'https://api.linear.app/graphql',init:{method:'POST',headers:{...headers,Authorization:token,'Content-Type':'application/json'},body:JSON.stringify({query:'{ viewer { id } }'})}}
    case 'notion': return {url:'https://api.notion.com/v1/users/me',init:{headers:{...headers,Authorization:`Bearer ${token}`,'Notion-Version':'2022-06-28'}}}
    case 'airtable': return bearer('https://api.airtable.com/v0/meta/bases',token)
    case 'figma': return header('https://api.figma.com/v1/me','X-Figma-Token',token)
    case 'canva': return bearer('https://api.canva.com/rest/v1/users/me/profile',token)
    case 'unsplash': return bearer('https://api.unsplash.com/photos/random',token,'Client-ID')
    case 'pexels': return header('https://api.pexels.com/v1/curated?per_page=1','Authorization',token)
    case 'pixabay': return {url:`https://pixabay.com/api/?key=${q(token)}&q=test&per_page=3`,init:{headers}}
    case 'giphy': return {url:`https://api.giphy.com/v1/gifs/trending?api_key=${q(token)}&limit=1`,init:{headers}}
    case 'removebg': return header('https://api.remove.bg/v1.0/account','X-Api-Key',token)
    case 'freesound': return bearer('https://freesound.org/apiv2/me/',token,'Token')
    case 'mapbox': return {url:`https://api.mapbox.com/search/geocode/v6/forward?q=test&limit=1&access_token=${q(token)}`,init:{headers}}
    case 'maptiler': return {url:`https://api.maptiler.com/geocoding/test.json?limit=1&key=${q(token)}`,init:{headers}}
    case 'geoapify': return {url:`https://api.geoapify.com/v1/geocode/search?text=test&limit=1&apiKey=${q(token)}`,init:{headers}}
    case 'here': return {url:`https://geocode.search.hereapi.com/v1/geocode?q=test&limit=1&apiKey=${q(token)}`,init:{headers}}
    case 'opencage': return {url:`https://api.opencagedata.com/geocode/v1/json?q=test&limit=1&key=${q(token)}`,init:{headers}}
    case 'locationiq': return {url:`https://us1.locationiq.com/v1/search?format=json&q=test&limit=1&key=${q(token)}`,init:{headers}}
    case 'ipinfo': return bearer('https://ipinfo.io/me',token)
    case 'weatherapi': return {url:`https://api.weatherapi.com/v1/current.json?q=London&key=${q(token)}`,init:{headers}}
    case 'openweather': return {url:`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${q(token)}`,init:{headers}}
    case 'tmdb': return bearer('https://api.themoviedb.org/3/configuration',token)
    case 'nasa': return {url:`https://api.nasa.gov/planetary/apod?api_key=${q(token)}`,init:{headers}}
    case 'coingecko': return header('https://api.coingecko.com/api/v3/ping','x-cg-demo-api-key',token)
    case 'alphavantage': return {url:`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${q(token)}`,init:{headers}}
    case 'exchangerate': return {url:`https://v6.exchangerate-api.com/v6/${q(token)}/latest/USD`,init:{headers}}
    case 'newsapi': return header('https://newsapi.org/v2/top-headlines?country=us&pageSize=1','X-Api-Key',token)
    case 'abstractapi': return {url:`https://ipgeolocation.abstractapi.com/v1/?api_key=${q(token)}`,init:{headers}}
    case 'stripe': return bearer('https://api.stripe.com/v1/balance',token)
    case 'lemonsqueezy': return bearer('https://api.lemonsqueezy.com/v1/users/me',token)
    case 'virustotal': return header('https://www.virustotal.com/api/v3/ip_addresses/8.8.8.8','x-apikey',token)
    case 'abuseipdb': return header('https://api.abuseipdb.com/api/v2/check?ipAddress=8.8.8.8&maxAgeInDays=90','Key',token)
    case 'ipqualityscore': return {url:`https://www.ipqualityscore.com/api/json/ip/${q(token)}/8.8.8.8`,init:{headers}}
    case 'storyblok': return {url:`https://api.storyblok.com/v2/cdn/spaces/me?token=${q(token)}`,init:{headers}}
    case 'datocms': return {url:'https://graphql.datocms.com/',init:{method:'POST',headers:{...headers,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({query:'{ __typename }'})}}
    case 'qstash': return bearer('https://qstash.upstash.io/v2/schedules',token)
    case 'pipedream': return bearer('https://api.pipedream.com/v1/users/me',token)
    case 'typeform': return bearer('https://api.typeform.com/me',token)
    case 'jotform': return {url:`https://api.jotform.com/user?apiKey=${q(token)}`,init:{headers}}
    case 'formspree': return bearer('https://formspree.io/api/0/forms',token)
    default: throw new Error('Live validation is not configured for this provider')
  }
}

export async function runCredentialTest(id:string, token:string):Promise<TestResult> {
  const clean=token.trim()
  if (!clean) throw new Error('API key is required')
  if (clean.length>4096) throw new Error('API key is too long')
  if (!LIVE_TESTER_SET.has(id)) return {status:'format-only',message:'The key is present, but this provider has no safe live identity endpoint in the directory. Verify it with the linked documentation.'}
  const spec=request(id,clean), started=Date.now()
  let response:Response
  try { response=await fetch(spec.url,{...spec.init,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)}) }
  catch { return {status:'inconclusive',message:'The provider could not be reached within 10 seconds.',latencyMs:Date.now()-started} }
  const latencyMs=Date.now()-started
  if ((spec.valid||[200,201,202,204]).includes(response.status)) return {status:'valid',message:'The provider accepted the credential.',httpStatus:response.status,latencyMs}
  if (response.status===401) return {status:'invalid',message:'The provider rejected the credential.',httpStatus:response.status,latencyMs}
  if ([403,404,409,429].includes(response.status)) return {status:'inconclusive',message:'The provider responded, but the key may need another permission scope or the account has a provider-side restriction.',httpStatus:response.status,latencyMs}
  return {status:'invalid',message:'The credential was not accepted for the read-only validation request.',httpStatus:response.status,latencyMs}
}
