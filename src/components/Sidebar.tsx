import { useState } from 'react'
import { useNotesStore } from '../store/notesStore'
import { useAuthStore } from '../store/authStore'
import type { ViewMode } from '../types'
import { CATEGORY_COLORS } from '../types'

export default function Sidebar() {
  const { categories, notes, viewMode, setViewMode, createCategory, deleteCategory, darkMode, toggleDarkMode, sidebarOpen, setSidebarOpen } = useNotesStore()
  const { user, signOut } = useAuthStore()
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0])
  const [showNewCat, setShowNewCat] = useState(false)

  const allCount = notes.filter(n => !n.is_deleted && !n.is_archived).length
  const pinnedCount = notes.filter(n => n.is_pinned && !n.is_deleted && !n.is_archived).length
  const archivedCount = notes.filter(n => n.is_archived && !n.is_deleted).length
  const trashCount = notes.filter(n => n.is_deleted).length

  const navItem = (label: string, icon: React.ReactNode, mode: ViewMode, count: number) => (
    <button
      onClick={() => { setViewMode(mode); if (window.innerWidth < 768) setSidebarOpen(false) }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        viewMode === mode
          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          viewMode === mode ? 'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
        }`}>{count}</span>
      )}
    </button>
  )

  const handleCreateCategory = async () => {
    if (!newCatName.trim() || !user) return
    await createCategory(user.id, newCatName.trim(), newCatColor)
    setNewCatName('')
    setShowNewCat(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:relative z-30 h-full w-64 flex flex-col
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Notlarım</span>
          </div>
          <button onClick={toggleDarkMode} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItem('Tüm Notlar', '📝', 'all', allCount)}
          {navItem('Sabitlendi', '📌', 'pinned', pinnedCount)}
          {navItem('Arşiv', '🗃️', 'archived', archivedCount)}
          {navItem('Çöp Kutusu', '🗑️', 'trash', trashCount)}

          {/* Categories */}
          <div className="pt-3 pb-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Klasörler</span>
              <button
                onClick={() => setShowNewCat(true)}
                className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {showNewCat && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2 space-y-2">
                <input
                  autoFocus
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                  placeholder="Klasör adı..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewCatColor(c)}
                      className={`w-5 h-5 rounded-full transition-transform ${newCatColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateCategory} className="flex-1 text-xs py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Oluştur</button>
                  <button onClick={() => setShowNewCat(false)} className="flex-1 text-xs py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg">İptal</button>
                </div>
              </div>
            )}

            {categories.map((cat) => {
              const catMode: ViewMode = `category:${cat.id}`
              const count = notes.filter(n => n.category_id === cat.id && !n.is_deleted && !n.is_archived).length
              return (
                <button
                  key={cat.id}
                  onClick={() => { setViewMode(catMode); if (window.innerWidth < 768) setSidebarOpen(false) }}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    viewMode === catMode
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-left truncate">{cat.name}</span>
                  {count > 0 && <span className="text-xs text-gray-400">{count}</span>}
                  <span
                    onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id) }}
                    className="hidden group-hover:flex text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              title="Çıkış yap"
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
