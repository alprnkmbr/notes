import { useEffect, useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { useNotesStore } from '../store/notesStore'
import { NOTE_COLORS } from '../types'

const SAVE_DELAY = 800

export default function NoteEditor() {
  const { notes, categories, activeNoteId, updateNote, setActiveNoteId } = useNotesStore()
  const note = notes.find(n => n.id === activeNoteId)
  const [title, setTitle] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const titleRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Not içeriğini buraya yazın...' }),
    ],
    editorProps: {
      attributes: { class: 'prose-editor min-h-48 focus:outline-none text-gray-800 dark:text-gray-200' },
    },
    onUpdate: ({ editor }) => {
      if (!note) return
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        updateNote(note.id, {
          content: editor.getHTML(),
          content_text: editor.getText(),
        })
      }, SAVE_DELAY)
    },
  })

  useEffect(() => {
    if (!note) return
    setTitle(note.title)
    if (editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || '')
    }
  }, [note?.id])

  const saveTitle = useCallback((val: string) => {
    if (!note) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => updateNote(note.id, { title: val }), SAVE_DELAY)
  }, [note?.id])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    saveTitle(e.target.value)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') editor?.commands.focus()
  }

  const addTag = () => {
    if (!note || !tagInput.trim()) return
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!note.tags.includes(tag)) {
      updateNote(note.id, { tags: [...note.tags, tag] })
    }
    setTagInput('')
    setShowTagInput(false)
  }

  const removeTag = (tag: string) => {
    if (!note) return
    updateNote(note.id, { tags: note.tags.filter(t => t !== tag) })
  }

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 text-center p-8">
        <div className="text-5xl mb-4">✏️</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Not seçin veya yeni oluşturun</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">Soldan bir not seçin ya da + Yeni butonuna tıklayın</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-w-0 h-full" style={{ backgroundColor: note.color !== '#ffffff' ? note.color + '33' : undefined }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex-wrap">
        {/* Back on mobile */}
        <button
          onClick={() => setActiveNoteId(null)}
          className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 mr-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <ToolBtn title="Kalın" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn title="İtalik" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn title="Altı çizili" onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')}>
          <span className="underline">U</span>
        </ToolBtn>
        <ToolBtn title="Üstü çizili" onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')}>
          <span className="line-through">S</span>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />

        <ToolBtn title="Başlık 1" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })}>
          H1
        </ToolBtn>
        <ToolBtn title="Başlık 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}>
          H2
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />

        <ToolBtn title="Madde listesi" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Numaralı liste" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Görev listesi" onClick={() => editor?.chain().focus().toggleTaskList().run()} active={editor?.isActive('taskList')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />

        <ToolBtn title="Alıntı" onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Kod" onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </ToolBtn>

        <div className="flex-1" />

        {/* Category picker */}
        <div className="relative">
          <button
            onClick={() => { setShowCategoryPicker(!showCategoryPicker); setShowColorPicker(false) }}
            title="Klasör"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {note.category_id ? (
              <>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categories.find(c => c.id === note.category_id)?.color }} />
                <span>{categories.find(c => c.id === note.category_id)?.name}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="hidden sm:inline">Klasör</span>
              </>
            )}
          </button>
          {showCategoryPicker && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg py-1 min-w-40">
              <button
                onClick={() => { updateNote(note.id, { category_id: null }); setShowCategoryPicker(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Klasörsüz
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { updateNote(note.id, { category_id: cat.id }); setShowCategoryPicker(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${note.category_id === cat.id ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowCategoryPicker(false) }}
            title="Not rengi"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-4 h-4 rounded-full border-2 border-gray-300" style={{ backgroundColor: note.color }} />
          </button>
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Not Rengi</p>
              <div className="grid grid-cols-4 gap-2">
                {NOTE_COLORS.map(({ value, label }) => (
                  <button
                    key={value}
                    title={label}
                    onClick={() => { updateNote(note.id, { color: value }); setShowColorPicker(false) }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${note.color === value ? 'border-primary-500 scale-110' : 'border-gray-200 dark:border-gray-600'}`}
                    style={{ backgroundColor: value }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pin */}
        <button
          title={note.is_pinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
          onClick={() => updateNote(note.id, { is_pinned: !note.is_pinned })}
          className={`p-1.5 rounded-lg transition-colors ${note.is_pinned ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          <svg className="w-4 h-4" fill={note.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Note content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Başlık..."
            className="w-full text-2xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 bg-transparent border-none outline-none mb-4"
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            {note.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 ml-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {showTagInput ? (
              <input
                autoFocus
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setShowTagInput(false) }}
                onBlur={() => { addTag(); setShowTagInput(false) }}
                placeholder="Etiket ekle..."
                className="text-xs px-2 py-1 border border-primary-300 dark:border-primary-600 rounded-full bg-transparent outline-none text-gray-700 dark:text-gray-300 w-28"
              />
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="text-xs text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Etiket ekle
              </button>
            )}
          </div>

          {/* Editor */}
          <EditorContent editor={editor} className="text-sm leading-relaxed text-gray-800 dark:text-gray-200" />
        </div>
      </div>

      {/* Close pickers on outside click */}
      {(showColorPicker || showCategoryPicker) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowColorPicker(false); setShowCategoryPicker(false) }}
        />
      )}
    </div>
  )
}

function ToolBtn({ title, onClick, active, children }: {
  title: string
  onClick: () => void
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  )
}
