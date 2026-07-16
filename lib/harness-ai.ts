import type { HarnessMode } from '@/lib/harness-core'

function deterministicSummary(exitCode: number, mode: HarnessMode) {
  return exitCode === 0
    ? `${mode} completed successfully. Review the captured output for warnings and follow-up work.`
    : `${mode} failed with exit code ${exitCode}. Start with the final error in the captured output, then reproduce it locally before changing code.`
}

export async function summarizeHarnessRun(input: {
  token: string | null
  repository: string
  gitRef: string
  mode: HarnessMode
  task: string
  exitCode: number
  output: string
}) {
  const token = process.env.AI_GATEWAY_API_KEY || input.token
  if (!token) return deterministicSummary(input.exitCode, input.mode)

  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.HARNESS_MODEL || 'google/gemini-2.5-flash-lite',
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: 'You analyze isolated project execution logs. Be concise and evidence-based. State the result, likely cause when a failure exists, and the next three actions. Never claim a file was changed and never invent output.',
          },
          {
            role: 'user',
            content: [
              `Repository: ${input.repository}`,
              `Ref: ${input.gitRef}`,
              `Mode: ${input.mode}`,
              `Requested task: ${input.task || 'No extra task supplied'}`,
              `Exit code: ${input.exitCode}`,
              'Execution output:',
              input.output.slice(-24_000),
            ].join('\n'),
          },
        ],
      }),
      cache: 'no-store',
    })

    if (!response.ok) return deterministicSummary(input.exitCode, input.mode)

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    return data.choices?.[0]?.message?.content?.trim().slice(0, 4_000)
      || deterministicSummary(input.exitCode, input.mode)
  } catch {
    return deterministicSummary(input.exitCode, input.mode)
  }
}
