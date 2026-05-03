import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNotesStore } from '../store/notesStore'
import { useAuthStore } from '../store/authStore'
import Sidebar from '../components/Sidebar'
import NoteList from '../components/NoteList'
import NoteEditor from '../components/NoteEditor'

export default function HomePage() {
  const { user } = useAuthStore()
  const { fetchNotes, fetchCategories, darkMode, activeNoteId } = useNotesStore()

  useEffect(() => {
    if (!user) return
    fetchNotes(user.id)
    fetchCategories(user.id)

    // Real-time subscription for notes
    const channel = supabase
      .channel('notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` },
        () => fetchNotes(user.id)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${user.id}` },
        () => fetchCategories(user.id)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  return (
    <div className={`flex h-dvh w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar />

        {/* On mobile: show list if no note selected, show editor if note selected */}
        <div className={`flex flex-1 overflow-hidden ${activeNoteId ? 'md:flex' : 'flex'}`}>
          <div className={`${activeNoteId ? 'hidden md:flex' : 'flex'} flex-col flex-shrink-0 w-full md:w-auto`}>
            <NoteList />
          </div>
          <div className={`${activeNoteId ? 'flex' : 'hidden md:flex'} flex-1 overflow-hidden`}>
            <NoteEditor />
          </div>
        </div>
      </div>
    </div>
  )
}
