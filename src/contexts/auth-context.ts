import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthContextValue = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  activeTeamId: string | null
  signInWithPassword: (email: string, password: string) => Promise<{
    success: boolean
    errorMessage: string | null
  }>
  signOut: () => Promise<{
    success: boolean
    errorMessage: string | null
  }>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
