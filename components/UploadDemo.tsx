'use client'

import { useState } from 'react'

// Client demo: ask our API for a presigned URL, then PUT the file directly to R2.
export function UploadDemo() {
  const [status, setStatus] = useState<string>('')
  const [url, setUrl] = useState<string | null>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('requesting upload URL…')
    setUrl(null)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed to presign')

      setStatus('uploading to R2…')
      const put = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type || 'application/octet-stream' },
        body: file,
      })
      if (!put.ok) throw new Error('R2 upload failed')

      setStatus('done ✓')
      setUrl(data.publicUrl)
    } catch (err) {
      setStatus('error: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div className="mt-4">
      <input type="file" onChange={onChange} className="text-sm" />
      {status && <p className="mt-2 text-sm text-muted">{status}</p>}
      {url && (
        <a href={url} target="_blank" className="mt-1 block text-sm text-accent underline">
          {url}
        </a>
      )}
    </div>
  )
}
