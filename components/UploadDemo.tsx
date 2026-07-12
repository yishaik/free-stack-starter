'use client'

import { useRef, useState } from 'react'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
])

export function UploadDemo() {
  const [status, setStatus] = useState('')
  const [url, setUrl] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.has(file.type)) return setStatus('Unsupported file type')
    if (file.size > MAX_BYTES) return setStatus('File must be 10 MB or smaller')

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('Requesting a secure upload URL…')
    setUrl(null)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to authorize upload')

      setStatus('Uploading directly to R2…')
      const upload = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        signal: controller.signal,
        body: file,
      })
      if (!upload.ok) throw new Error('R2 upload failed')

      setStatus('Upload complete ✓')
      setUrl(data.publicUrl ?? null)
    } catch (error) {
      setStatus(error instanceof DOMException && error.name === 'AbortError'
        ? 'Upload cancelled'
        : `Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,text/plain"
        onChange={onChange}
        className="text-sm"
      />
      {status && <p className="text-sm text-muted" role="status">{status}</p>}
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="block text-sm text-accent underline">
          Open uploaded file
        </a>
      )}
      {status.includes('Uploading') && (
        <button type="button" onClick={() => abortRef.current?.abort()} className="text-sm underline">
          Cancel
        </button>
      )}
    </div>
  )
}
