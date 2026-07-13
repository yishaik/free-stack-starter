// Validates a post-login `next` destination. Only same-origin absolute paths are
// allowed. Rejects protocol-relative targets like `//host` and `/\host` (browsers
// normalize the backslash to a slash), which are a classic open-redirect vector
// (CWE-601). Used by both the login page and the login server actions.
export function safeRedirectPath(candidate: unknown, fallback = '/dashboard') {
  return typeof candidate === 'string' && /^\/(?![/\\])/.test(candidate) ? candidate : fallback
}
