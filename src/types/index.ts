export interface Note {
  id: string
  user_id: string
  category_id: string | null
  title: string
  content: string
  content_text: string
  color: string
  is_pinned: boolean
  is_archived: boolean
  is_deleted: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
  updated_at: string
}

export type ViewMode = 'all' | 'pinned' | 'archived' | 'trash' | `category:${string}`

export const NOTE_COLORS = [
  { value: '#ffffff', label: 'Beyaz' },
  { value: '#fef9c3', label: 'Sarı' },
  { value: '#dcfce7', label: 'Yeşil' },
  { value: '#dbeafe', label: 'Mavi' },
  { value: '#fce7f3', label: 'Pembe' },
  { value: '#ede9fe', label: 'Mor' },
  { value: '#ffedd5', label: 'Turuncu' },
  { value: '#f1f5f9', label: 'Gri' },
]

export const CATEGORY_COLORS = [
  '#16a34a', '#2563eb', '#dc2626', '#d97706',
  '#7c3aed', '#db2777', '#0891b2', '#65a30d',
]
