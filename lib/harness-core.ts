export const HARNESS_MODES = ['inspect', 'test', 'build'] as const

export type HarnessMode = (typeof HARNESS_MODES)[number]

const GITHUB_PART = /^[A-Za-z0-9_.-]{1,100}$/
const GIT_REF = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/

export function normalizeRepository(value: unknown): string | null {
  if (typeof value !== 'string') return null

  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com') return null
    if (url.username || url.password || url.port || url.search || url.hash) return null

    const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/')
    if (parts.length !== 2) return null

    const owner = parts[0]
    const repository = parts[1].replace(/\.git$/i, '')
    if (!GITHUB_PART.test(owner) || !GITHUB_PART.test(repository)) return null

    return `https://github.com/${owner}/${repository}.git`
  } catch {
    return null
  }
}

export function normalizeGitRef(value: unknown): string | null {
  const ref = typeof value === 'string' && value.trim() ? value.trim() : 'main'
  if (!GIT_REF.test(ref) || ref.includes('..') || ref.includes('//') || ref.endsWith('/')) return null
  return ref
}

export function normalizeMode(value: unknown): HarnessMode | null {
  return typeof value === 'string' && HARNESS_MODES.includes(value as HarnessMode)
    ? value as HarnessMode
    : null
}

export function normalizeTask(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 2_000)
}

export function truncateOutput(value: string, max = 48_000) {
  if (value.length <= max) return value
  return `${value.slice(0, max)}\n\n[output truncated by harness]`
}

const detectAndInstallNode = `
if [ -f pnpm-lock.yaml ]; then
  corepack enable
  pnpm install --frozen-lockfile
elif [ -f yarn.lock ]; then
  corepack enable
  yarn install --immutable || yarn install --frozen-lockfile
elif [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi`

export function commandForMode(mode: HarnessMode): string {
  if (mode === 'inspect') {
    return `set -o pipefail
printf 'Repository: '; git remote get-url origin || true
printf 'Commit: '; git rev-parse HEAD
printf 'Branch/ref: '; git rev-parse --abbrev-ref HEAD || true
printf '\nTop-level files:\n'
find . -maxdepth 2 -type f -not -path './.git/*' | sort | head -200
if [ -f package.json ]; then
  printf '\nNode project metadata:\n'
  node -e "const p=require('./package.json'); console.log(JSON.stringify({name:p.name,engines:p.engines,scripts:p.scripts},null,2))"
fi
if [ -f pyproject.toml ]; then
  printf '\nPython project detected: pyproject.toml\n'
fi`
  }

  if (mode === 'test') {
    return `set -o pipefail
if [ -f package.json ]; then
  ${detectAndInstallNode}
  npm run test --if-present
elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  python3 -m venv .venv
  . .venv/bin/activate
  python -m pip install --upgrade pip
  if [ -f requirements.txt ]; then pip install -r requirements.txt; else pip install -e .; fi
  python -m pytest
else
  echo 'No supported Node or Python project manifest found.' >&2
  exit 2
fi`
  }

  return `set -o pipefail
if [ -f package.json ]; then
  ${detectAndInstallNode}
  npm run build --if-present
elif [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  python3 -m venv .venv
  . .venv/bin/activate
  python -m pip install --upgrade pip
  if [ -f requirements.txt ]; then pip install -r requirements.txt; else pip install -e .; fi
  python -m compileall -q .
else
  echo 'No supported Node or Python project manifest found.' >&2
  exit 2
fi`
}
