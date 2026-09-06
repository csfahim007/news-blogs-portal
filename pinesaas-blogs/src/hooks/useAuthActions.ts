import { useState, type SyntheticEvent } from 'react'
import { useAuth } from '../context/AuthContext'

type FormSubmitEvent = SyntheticEvent<HTMLFormElement>

export function useAuthActions(onAdminOpen: () => void) {
  const { token, name, role, login: authenticate, register: createAccount, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [authError, setAuthError] = useState('')
  const login = async (event: FormSubmitEvent) => { event.preventDefault(); setAuthError(''); try { await authenticate(authEmail, authPassword); setAuthPassword(''); setAuthOpen(false) } catch (error) { setAuthError(error instanceof Error ? error.message : 'Login failed.') } }
  const register = async (event: FormSubmitEvent) => { event.preventDefault(); setAuthError(''); try { await createAccount(registerName, authEmail, authPassword); setAuthPassword(''); setRegisterName(''); setAuthOpen(false) } catch (error) { setAuthError(error instanceof Error ? error.message : 'Registration failed.') } }
  const accountAction = () => { if (role === 'admin') onAdminOpen(); else if (token) logout(); else setAuthOpen(true) }
  return { token, name, role, authOpen, authMode, authEmail, authPassword, registerName, authError, login, register, accountAction, closeAuth: () => setAuthOpen(false), openAuth: () => { setAuthOpen(true); setAuthError('') }, setAuthMode: (mode: 'login' | 'register') => { setAuthMode(mode); setAuthError('') }, setAuthEmail, setAuthPassword, setRegisterName }
}
