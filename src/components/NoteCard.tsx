import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Note, Category } from '../types'

interface Props {
  note: Note
  isActive: boolean
  category?: Category
  onClick: () => void
  onPin: () => void
  onArchive: () => void
  onDelete: () => void
  onRestore?: () => void
  onDeletePermanently?: () => void
  isTrash?: boolean
  isArchived?: boolean
}

export default function NoteCard({ note, isActive, category, onClick, onPin, onArchive, onDelete, onRestore, onDeletePermanently, isTrash, isArchived }: Props) {
  const timeAgo = formatDistanceToNow(new Date(note.updated_at), { addSuffix: true, locale: tr })
  const preview = note.content_text.slice(0, 120)

  return (
    <div
      onClick={onClick}
      className={`note-card relative p-4 rounded-2xl cursor-pointer border transition-all ${
        isActive
          ? 'border-primary-400 dark:border-primary-500 shadow-md ring-2 ring-primary-200 dark:ring-primary-800'
          : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
      style={{ backgroundColor: note.color === '#ffffff' ? undefined : note.color }}
    >
      {/* Background for white notes */}
      {note.color === '#ffffff' && (
        <div className="absolute inset-0 rounded-2xl bg-white dark:bg-gray-800" />
      )}

      <div className="relative">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 flex-1">
            {note.title || <span className="text-gray-400 italic">Başlıksız not</span>}
          </h3>
          {note.is_pinned && !isTrash && (
            <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z" />
            </svg>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{preview}</p>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {category && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isTrash ? (
              <>
                <ActionBtn title="Geri yükle" onClick={(e) => { e.stopPropagation(); onRestore?.() }} color="green">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </ActionBtn>
                <ActionBtn title="Kalıcı sil" onClick={(e) => { e.stopPropagation(); onDeletePermanently?.() }} color="red">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </ActionBtn>
              </>
            ) : isArchived ? (
              <ActionBtn title="Arşivden çıkar" onClick={(e) => { e.stopPropagation(); onArchive() }} color="blue">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </ActionBtn>
            ) : (
              <>
                <ActionBtn title={note.is_pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'} onClick={(e) => { e.stopPropagation(); onPin() }} color="yellow">
                  <svg className="w-3.5 h-3.5" fill={note.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </ActionBtn>
                <ActionBtn title="Arşivle" onClick={(e) => { e.stopPropagation(); onArchive() }} color="blue">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </ActionBtn>
                <ActionBtn title="Sil" onClick={(e) => { e.stopPropagation(); onDelete() }} color="red">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </ActionBtn>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ title, onClick, color, children }: {
  title: string
  onClick: (e: React.MouseEvent) => void
  color: 'green' | 'red' | 'yellow' | 'blue'
  children: React.ReactNode
}) {
  const colors = {
    green: 'hover:text-green-600 dark:hover:text-green-400',
    red: 'hover:text-red-600 dark:hover:text-red-400',
    yellow: 'hover:text-yellow-600 dark:hover:text-yellow-400',
    blue: 'hover:text-blue-600 dark:hover:text-blue-400',
  }
  return (
    <button title={title} onClick={onClick} className={`p-1 text-gray-400 ${colors[color]} transition-colors rounded`}>
      {children}
    </button>
  )
}
