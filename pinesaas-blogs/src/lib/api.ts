const API_URL = import.meta.env.VITE_API_URL || '/api'

export const SESSION_ID = localStorage.getItem('pinesaas_session_id') || crypto.randomUUID()
localStorage.setItem('pinesaas_session_id', SESSION_ID)

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)
  if (!response.ok) throw new Error(`API returned ${response.status}`)
  return response.json() as Promise<T>
}

export async function sendJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || `API returned ${response.status}`)
  return body as T
}

export function dateLabel(value?: string) {
  if (!value) return 'Recently'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export function readingTime(story: import('../types').Story) {
  const words = (story.content || story.excerpt || '').trim().split(/\s+/).filter(Boolean).length
  const comments = story._count?.comments ?? story.feedbackCount ?? 0
  return `${Math.max(2, Math.ceil(words / 190))} min · ${story.views || 0} views · ${comments} comments`
}
