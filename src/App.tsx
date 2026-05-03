import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { useNotesStore } from './store/notesStore'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'

export default function App() {
  const { user, setUser, setLoading, loading } = useAuthStore()
  const { darkMode } = useNotesStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className={`${darkMode ? 'dark' : ''} h-dvh flex items-center justify-center bg-white dark:bg-gray-900`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl animate-pulse" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      {user ? <HomePage /> : <AuthPage />}
    </div>
  )
}
