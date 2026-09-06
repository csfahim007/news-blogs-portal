/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { sendJson } from '../lib/api'
import type { AuthResponse } from '../types'

type AuthContextValue = {
  token: string
  name: string
  role: string
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('pinesaas_token') || '')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const saveSession = (result: AuthResponse) => { localStorage.setItem('pinesaas_token', result.token); setToken(result.token); setName(result.user.name); setRole(result.user.role) }
  const login = async (email: string, password: string) => { saveSession(await sendJson<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })) }
  const register = async (userName: string, email: string, password: string) => { saveSession(await sendJson<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ name: userName, email, password }) })) }
  const logout = () => { localStorage.removeItem('pinesaas_token'); setToken(''); setName(''); setRole('') }
  const value = { token, name, role, login, register, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
