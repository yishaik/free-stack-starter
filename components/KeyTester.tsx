'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CATEGORIES, SERVICES } from '@/lib/services'
import { TESTER_DEFINITIONS } from '@/lib/testers'
import { LIVE_TESTER_SET } from '@/lib/live-testers'

type Result={status?:'valid'|'invalid'|'inconclusive'|'format-only';message?:string;httpStatus?:number;latencyMs?:number;error?:string}

function parseEnv(text:string){
  const parsed:Record<string,string>={}
  for(const raw of text.split('\n')){
    const match=raw.trim().match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if(!match) continue
    let value=match[2].trim()
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'"))) value=value.slice(1,-1)
    parsed[match[1]]=value
  }
  return parsed
}

export function KeyTester({initialServiceId}:{initialServiceId?:string}){
  const initial=SERVICES.some((s)=>s.id===initialServiceId)?initialServiceId!:SERVICES[0].id
  const [serviceId,setServiceId]=useState(initial)
  const [token,setToken]=useState('')
  const [envText,setEnvText]=useState('')
  const [result,setResult]=useState<Result|null>(null)
  const [testing,setTesting]=useState(false)
  const service=SERVICES.find((s)=>s.id===serviceId)!
  const definition=service.testerId?TESTER_DEFINITIONS[service.testerId]:undefined
  const live=Boolean(service.testerId&&LIVE_TESTER_SET.has(service.testerId))
  const grouped=useMemo(()=>CATEGORIES.map((category)=>({category,services:SERVICES.filter((s)=>s.category===category)})),[])

  function changeService(id:string){setServiceId(id);setToken('');setEnvText('');setResult(null);window.history.replaceState(null,'',`/test-keys?service=${encodeURIComponent(id)}`)}
  function importEnv(){
    if(!definition) return
    const env=parseEnv(envText)
    const name=definition.envNames.find((item)=>env[item]!==undefined)
    if(name){setToken(env[name]);setResult({status:'format-only',message:`Imported ${name} locally.`})}
    else setResult({status:'format-only',message:'No matching environment variable was found.'})
  }
  async function submit(event:React.FormEvent){
    event.preventDefault();setTesting(true);setResult(null)
    try{
      const response=await fetch('/api/test-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({serviceId,token})})
      setResult(await response.json())
    }catch{setResult({error:'The tester could not reach the server.'})}
    finally{setTesting(false)}
  }
  const resultStyle=result?.error||result?.status==='invalid'?'border-red-500/40 bg-red-500/10 text-red-200':result?.status==='valid'?'border-emerald-500/40 bg-emerald-500/10 text-emerald-200':'border-amber-500/40 bg-amber-500/10 text-amber-100'

  return <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
    <aside className="h-fit rounded-2xl border border-line bg-panel p-5 lg:sticky lg:top-6">
      <label className="grid gap-2 text-sm font-medium">Service
        <select value={serviceId} onChange={(e)=>changeService(e.target.value)} className="h-11 rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-accent">
          {grouped.map((group)=><optgroup key={group.category} label={group.category}>{group.services.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}
        </select>
      </label>
      <div className="mt-5 rounded-xl border border-line bg-bg p-4">
        <div className="flex items-start justify-between gap-3"><div><div className="font-semibold">{service.name}</div><div className="mt-1 text-xs text-muted">{service.category}</div></div><span className={`rounded-full border px-2 py-1 text-[10px] ${live?'border-emerald-500/30 text-emerald-300':'border-line text-muted'}`}>{live?'LIVE CHECK':definition?'GUIDED':'NO KEY'}</span></div>
        <p className="mt-3 text-sm leading-6 text-muted">{service.summary}</p>
        <div className="mt-4 grid grid-cols-2 gap-2"><a href={service.signup} target="_blank" rel="noreferrer" className="rounded-lg bg-accent px-3 py-2 text-center text-sm font-semibold text-[#06111a]">{service.actionLabel} ↗</a><a href={service.docs} target="_blank" rel="noreferrer" className="rounded-lg border border-line px-3 py-2 text-center text-sm hover:border-accent">Docs ↗</a></div>
      </div>
      <Link href="/" className="mt-4 block text-center text-sm text-muted hover:text-accent">← Back to directory</Link>
    </aside>

    <main className="rounded-2xl border border-line bg-panel p-5 sm:p-7">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Credential workbench</p>
      <h1 className="mt-2 text-2xl font-bold">Test {service.name} setup</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Credentials stay in this page’s memory and are sent once to an allowlisted server route. The application does not save, echo or place them in a URL.</p>

      {!definition?<div className="mt-8 rounded-xl border border-line bg-bg p-6"><h2 className="font-semibold">No conventional API key required</h2><p className="mt-2 text-sm leading-6 text-muted">This is primarily a public resource, browser tool or downloadable project. Use the sign-up/get-started and documentation links above.</p></div>:
      <form onSubmit={submit} className="mt-8 space-y-6">
        <label className="grid gap-2 text-sm font-medium"><span>{definition.label}</span><input required type="password" value={token} onChange={(e)=>setToken(e.target.value)} placeholder={definition.placeholder} autoComplete="off" spellCheck={false} className="h-11 rounded-xl border border-line bg-bg px-4 font-mono text-sm outline-none placeholder:text-muted/50 focus:border-accent"/><span className="font-mono text-[10px] font-normal leading-5 text-muted">{definition.envNames.join(' · ')}</span></label>
        <details className="rounded-xl border border-line bg-bg p-4"><summary className="cursor-pointer text-sm font-semibold">Import from a .env snippet</summary><p className="mt-2 text-xs leading-5 text-muted">Parsing happens in your browser; the snippet is not uploaded.</p><textarea value={envText} onChange={(e)=>setEnvText(e.target.value)} placeholder={`${definition.envNames[0]}=`} className="mt-3 min-h-24 w-full rounded-xl border border-line bg-panel p-3 font-mono text-xs outline-none focus:border-accent"/><button type="button" onClick={importEnv} className="mt-3 rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-accent">Import locally</button></details>
        <div className="flex flex-wrap items-center gap-3"><button disabled={testing} className="rounded-xl bg-accent px-5 py-3 font-semibold text-[#06111a] disabled:opacity-50">{testing?'Checking…':live?'Run secure live test':'Check key setup'}</button><span className="text-xs text-muted">Rate limited · 10-second timeout · response bodies discarded</span></div>
      </form>}

      {result&&<div role="status" className={`mt-6 rounded-xl border p-4 text-sm ${resultStyle}`}><div className="font-semibold">{result.error?'Test failed':result.status==='valid'?'Credentials accepted':result.status==='invalid'?'Credentials rejected':result.status==='format-only'?'Setup check complete':'Result is inconclusive'}</div><p className="mt-1 leading-6">{result.error||result.message}</p>{(result.httpStatus||result.latencyMs)&&<p className="mt-2 font-mono text-[11px] opacity-80">{result.httpStatus?`HTTP ${result.httpStatus}`:''}{result.httpStatus&&result.latencyMs?' · ':''}{result.latencyMs?`${result.latencyMs} ms`:''}</p>}</div>}

      <section className="mt-10 border-t border-line pt-6"><h2 className="font-semibold">Security model</h2><div className="mt-3 grid gap-3 text-sm leading-6 text-muted md:grid-cols-2"><p className="rounded-xl bg-bg p-4"><strong className="text-ink">Allowlisted destinations.</strong> No arbitrary URLs or generic proxying.</p><p className="rounded-xl bg-bg p-4"><strong className="text-ink">No storage.</strong> No database write, localStorage or analytics event.</p><p className="rounded-xl bg-bg p-4"><strong className="text-ink">Read-only checks.</strong> Identity, account, metadata, list or ping endpoints only.</p><p className="rounded-xl bg-bg p-4"><strong className="text-ink">Scope-aware.</strong> Permission failures are reported as inconclusive, not automatically invalid.</p></div></section>
    </main>
  </div>
}
