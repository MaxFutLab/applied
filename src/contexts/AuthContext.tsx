import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase/client'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return
        }

        if (error) {
          setSession(null)
          setUser(null)
          setIsLoading(false)
          return
        }

        setSession(data.session)
        setUser(data.session?.user ?? null)
        setIsLoading(false)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setSession(null)
        setUser(null)
        setIsLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signInWithPassword(email: string, password: string) {
    if (!supabase) {
      return {
        success: false,
        errorMessage: 'Supabase Auth nao esta configurado neste ambiente.',
      }
    }

    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setIsLoading(false)
      return {
        success: false,
        errorMessage: error.message,
      }
    }

    setSession(data.session)
    setUser(data.user)
    setIsLoading(false)

    return {
      success: true,
      errorMessage: null,
    }
  }

  async function signOut() {
    if (!supabase) {
      setSession(null)
      setUser(null)
      setIsLoading(false)
      return {
        success: true,
        errorMessage: null,
      }
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setIsLoading(false)
      return {
        success: false,
        errorMessage: error.message,
      }
    }

    setSession(null)
    setUser(null)
    setIsLoading(false)

    return {
      success: true,
      errorMessage: null,
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: Boolean(user),
      activeTeamId: null,
      signInWithPassword,
      signOut,
    }),
    [isLoading, session, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
