import { create } from 'zustand'
import type { Note, Category, ViewMode } from '../types'
import { supabase } from '../lib/supabase'

interface NotesState {
  notes: Note[]
  categories: Category[]
  activeNoteId: string | null
  viewMode: ViewMode
  searchQuery: string
  darkMode: boolean
  sidebarOpen: boolean

  setNotes: (notes: Note[]) => void
  setCategories: (categories: Category[]) => void
  setActiveNoteId: (id: string | null) => void
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (q: string) => void
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void

  fetchNotes: (userId: string) => Promise<void>
  fetchCategories: (userId: string) => Promise<void>

  createNote: (userId: string, categoryId?: string | null) => Promise<Note | null>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNotePermanently: (id: string) => Promise<void>

  createCategory: (userId: string, name: string, color: string) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
}

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  categories: [],
  activeNoteId: null,
  viewMode: 'all',
  searchQuery: '',
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  sidebarOpen: window.innerWidth >= 768,

  setNotes: (notes) => set({ notes }),
  setCategories: (categories) => set({ categories }),
  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setViewMode: (viewMode) => set({ viewMode, activeNoteId: null }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  fetchNotes: async (userId) => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (data) set({ notes: data })
  },

  fetchCategories: async (userId) => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (data) set({ categories: data })
  },

  createNote: async (userId, categoryId = null) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: userId, category_id: categoryId, title: '', content: '', content_text: '' })
      .select()
      .single()
    if (error || !data) return null
    set((s) => ({ notes: [data, ...s.notes], activeNoteId: data.id }))
    return data
  },

  updateNote: async (id, updates) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }))
    await supabase.from('notes').update(updates).eq('id', id)
  },

  deleteNotePermanently: async (id) => {
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      activeNoteId: s.activeNoteId === id ? null : s.activeNoteId,
    }))
    await supabase.from('notes').delete().eq('id', id)
  },

  createCategory: async (userId, name, color) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name, color })
      .select()
      .single()
    if (error || !data) return
    set((s) => ({ categories: [...s.categories, data] }))
  },

  updateCategory: async (id, updates) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
    await supabase.from('categories').update(updates).eq('id', id)
  },

  deleteCategory: async (id) => {
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
    await supabase.from('categories').delete().eq('id', id)
  },
}))
