import { useMemo } from 'react'
import { useNotesStore } from '../store/notesStore'
import { useAuthStore } from '../store/authStore'
import NoteCard from './NoteCard'
import type { Note } from '../types'

export default function NoteList() {
  const { notes, categories, activeNoteId, viewMode, searchQuery, setActiveNoteId, createNote, updateNote, deleteNotePermanently, setSidebarOpen } = useNotesStore()
  const { user } = useAuthStore()

  const filtered = useMemo(() => {
    let list: Note[]

    if (viewMode === 'trash') {
      list = notes.filter(n => n.is_deleted)
    } else if (viewMode === 'archived') {
      list = notes.filter(n => n.is_archived && !n.is_deleted)
    } else if (viewMode === 'pinned') {
      list = notes.filter(n => n.is_pinned && !n.is_archived && !n.is_deleted)
    } else if (viewMode.startsWith('category:')) {
      const catId = viewMode.replace('category:', '')
      list = notes.filter(n => n.category_id === catId && !n.is_archived && !n.is_deleted)
    } else {
      list = notes.filter(n => !n.is_archived && !n.is_deleted)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content_text.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    // Pinned first for non-trash/archive views
    if (viewMode !== 'trash' && viewMode !== 'archived' && viewMode !== 'pinned') {
      const pinned = list.filter(n => n.is_pinned)
      const unpinned = list.filter(n => !n.is_pinned)
      list = [...pinned, ...unpinned]
    }

    return list
  }, [notes, viewMode, searchQuery])

  const handleNewNote = async () => {
    if (!user) return
    const catId = viewMode.startsWith('category:') ? viewMode.replace('category:', '') : null
    await createNote(user.id, catId)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const viewLabels: Record<string, string> = {
    all: 'Tüm Notlar',
    pinned: 'Sabitlenmiş',
    archived: 'Arşiv',
    trash: 'Çöp Kutusu',
  }

  const getTitle = () => {
    if (viewMode.startsWith('category:')) {
      const catId = viewMode.replace('category:', '')
      return categories.find(c => c.id === catId)?.name ?? 'Klasör'
    }
    return viewLabels[viewMode] ?? 'Notlar'
  }

  return (
    <div className="flex flex-col h-full w-full md:w-72 lg:w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => useNotesStore.getState().setSidebarOpen(true)}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="font-bold text-gray-900 dark:text-white text-base">{getTitle()}</h2>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{filtered.length}</span>
        </div>
        {viewMode !== 'trash' && (
          <button
            onClick={handleNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Yeni</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => useNotesStore.getState().setSearchQuery(e.target.value)}
            placeholder="Notlarda ara..."
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none flex-1"
          />
          {searchQuery && (
            <button onClick={() => useNotesStore.getState().setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-4xl mb-3">
              {viewMode === 'trash' ? '🗑️' : viewMode === 'archived' ? '🗃️' : searchQuery ? '🔍' : '📝'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Sonuç bulunamadı' : viewMode === 'trash' ? 'Çöp kutusu boş' : viewMode === 'archived' ? 'Arşiv boş' : 'Henüz not yok'}
            </p>
            {!searchQuery && viewMode === 'all' && (
              <button onClick={handleNewNote} className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline">
                İlk notunu oluştur →
              </button>
            )}
          </div>
        ) : (
          filtered.map((note) => {
            const category = categories.find(c => c.id === note.category_id)
            return (
              <div key={note.id} className="group">
                <NoteCard
                  note={note}
                  isActive={activeNoteId === note.id}
                  category={category}
                  onClick={() => {
                    setActiveNoteId(note.id)
                    if (window.innerWidth < 768) useNotesStore.getState().setSidebarOpen(false)
                  }}
                  onPin={() => updateNote(note.id, { is_pinned: !note.is_pinned })}
                  onArchive={() => updateNote(note.id, { is_archived: !note.is_archived })}
                  onDelete={() => updateNote(note.id, { is_deleted: true })}
                  onRestore={() => updateNote(note.id, { is_deleted: false })}
                  onDeletePermanently={() => deleteNotePermanently(note.id)}
                  isTrash={viewMode === 'trash'}
                  isArchived={viewMode === 'archived'}
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
