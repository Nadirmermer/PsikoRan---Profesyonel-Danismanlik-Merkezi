import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  Plus, 
  Edit, 
  Trash, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  FileText,
  X,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { generateEncryptionKey, generateIV, encryptData } from '../../utils/encryption';

// MenuBar bileşenini genişletelim
interface MenuBarProps {
  editor: any;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const showTooltip = (id: string) => {
    setActiveTooltip(id);
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  return (
    <div className="flex flex-wrap gap-1 p-1.5 sm:p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
      {/* Metin Formatları */}
      <div className="flex flex-wrap gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Kalın"
            onMouseEnter={() => showTooltip('bold')}
            onMouseLeave={hideTooltip}
          >
            <Bold className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('bold') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'bold' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Kalın (Ctrl+B)
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="İtalik"
            onMouseEnter={() => showTooltip('italic')}
            onMouseLeave={hideTooltip}
          >
            <Italic className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('italic') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'italic' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              İtalik (Ctrl+I)
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Altı Çizili"
            onMouseEnter={() => showTooltip('underline')}
            onMouseLeave={hideTooltip}
          >
            <UnderlineIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('underline') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'underline' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Altı Çizili (Ctrl+U)
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('highlight') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Vurgula"
            onMouseEnter={() => showTooltip('highlight')}
            onMouseLeave={hideTooltip}
          >
            <Highlighter className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('highlight') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'highlight' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Vurgula
            </div>
          )}
        </div>
      </div>

      {/* Başlıklar */}
      <div className="flex flex-wrap gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Başlık 1"
            onMouseEnter={() => showTooltip('h1')}
            onMouseLeave={hideTooltip}
          >
            <Heading1 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('heading', { level: 1 }) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'h1' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Başlık 1
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Başlık 2"
            onMouseEnter={() => showTooltip('h2')}
            onMouseLeave={hideTooltip}
          >
            <Heading2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('heading', { level: 2 }) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'h2' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Başlık 2
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Başlık 3"
            onMouseEnter={() => showTooltip('h3')}
            onMouseLeave={hideTooltip}
          >
            <Heading3 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('heading', { level: 3 }) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'h3' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Başlık 3
            </div>
          )}
        </div>
      </div>

      {/* Listeler */}
      <div className="flex flex-wrap gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Madde İşaretli Liste"
            onMouseEnter={() => showTooltip('bulletList')}
            onMouseLeave={hideTooltip}
          >
            <List className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('bulletList') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'bulletList' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Madde İşaretli Liste
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Numaralı Liste"
            onMouseEnter={() => showTooltip('orderedList')}
            onMouseLeave={hideTooltip}
          >
            <ListOrdered className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('orderedList') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'orderedList' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Numaralı Liste
            </div>
          )}
        </div>
      </div>

      {/* Hizalama */}
      <div className="flex flex-wrap gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Sola Hizala"
            onMouseEnter={() => showTooltip('alignLeft')}
            onMouseLeave={hideTooltip}
          >
            <AlignLeft className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive({ textAlign: 'left' }) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'alignLeft' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Sola Hizala
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Ortala"
            onMouseEnter={() => showTooltip('alignCenter')}
            onMouseLeave={hideTooltip}
          >
            <AlignCenter className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive({ textAlign: 'center' }) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'alignCenter' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Ortala
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Sağa Hizala"
            onMouseEnter={() => showTooltip('alignRight')}
            onMouseLeave={hideTooltip}
          >
            <AlignRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive({ textAlign: 'right' }) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'alignRight' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Sağa Hizala
            </div>
          )}
        </div>
      </div>

      {/* Diğer Özellikler */}
      <div className="flex flex-wrap gap-1">
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Alıntı"
            onMouseEnter={() => showTooltip('blockquote')}
            onMouseLeave={hideTooltip}
          >
            <Quote className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('blockquote') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'blockquote' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Alıntı
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Kod Bloğu"
            onMouseEnter={() => showTooltip('codeBlock')}
            onMouseLeave={hideTooltip}
          >
            <Code className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('codeBlock') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'codeBlock' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Kod Bloğu
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => {
              if (editor.isActive('link')) {
                removeLink();
              } else {
                setShowLinkInput(!showLinkInput);
              }
            }}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Bağlantı"
            onMouseEnter={() => showTooltip('link')}
            onMouseLeave={hideTooltip}
          >
            <LinkIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('link') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'link' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Bağlantı Ekle
            </div>
          )}
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 z-10 flex items-center">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="URL girin"
                className="text-xs sm:text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setLink();
                  }
                }}
              />
              <button
                onClick={setLink}
                className="ml-1 px-2 py-1 text-xs sm:text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Ekle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SessionNote {
  id: string;
  created_at: string;
  title: string;
  content: string;
  encrypted_content: string;
  encryption_key: string;
  iv: string;
  professional_id: string;
  client_id: string;
  attachments?: string[];
  professional?: {
    full_name: string;
  };
}

interface SessionNotesTabProps {
  clientId: string;
  sessionNotes: SessionNote[];
  loadSessionNotes: () => Promise<boolean>;
}

export const SessionNotesTab: React.FC<SessionNotesTabProps> = ({
  clientId,
  sessionNotes,
  loadSessionNotes,
}) => {
  const { professional } = useAuth();
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [editedNoteTitle, setEditedNoteTitle] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [editAttachments, setEditAttachments] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [previewAttachments, setPreviewAttachments] = useState<string[]>([]);
  const [editPreviewAttachments, setEditPreviewAttachments] = useState<string[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  
  // Modal için referanslar
  const editDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const successDialogRef = useRef(null);
  const errorDialogRef = useRef(null);

  // Yeni not editörü
  const newNoteEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Not içeriğini buraya yazın...',
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[150px] p-3 sm:p-4 dark:prose-invert',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter') {
          event.stopPropagation();
        }
        return false;
      },
    },
  });

  // Düzenleme editörü
  const editNoteEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Not içeriğini buraya yazın...',
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
    ],
    content: editedNoteContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[150px] p-3 sm:p-4 dark:prose-invert',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter') {
          event.stopPropagation();
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      setEditedNoteContent(editor.getHTML());
    },
  });

  // Düzenlenen notun içeriğini editöre yükle
  useEffect(() => {
    if (editingNote && editNoteEditor) {
      editNoteEditor.commands.setContent(editingNote.content);
      // Modal açıldığında editöre odaklan
      if (isEditDialogOpen) {
        setTimeout(() => {
          editNoteEditor.commands.focus();
        }, 100);
      }
    }
  }, [editingNote, editNoteEditor, isEditDialogOpen]);

  async function uploadFilesToSupabase(files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const fileName = `${Date.now()}_${file.name}`;
        
        // Dosya boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Dosya boyutu çok büyük: ${file.name}. Maksimum 5MB olmalıdır.`);
        }

        // Dosyayı yükle
        const { data, error } = await supabase.storage
          .from('session-attachments')
          .upload(fileName, file, {
            cacheControl: '0',
            upsert: true
          });

        if (error) throw error;

        // Public URL al
        const { data: urlData } = await supabase.storage
          .from('session-attachments')
          .getPublicUrl(fileName);

        if (!urlData?.publicUrl) {
          throw new Error('Dosya URL\'i alınamadı');
        }

        uploadedUrls.push(urlData.publicUrl);
      } catch (error: any) {
        console.error('Dosya yükleme hatası:', error);
        throw new Error(`${file.name} yüklenirken hata oluştu: ${error.message}`);
      }
    }

    return uploadedUrls;
  }

  async function deleteFileFromSupabase(fileUrl: string) {
    try {
      // URL'den dosya adını çıkar
      const fileName = fileUrl.split('/').pop();
      if (!fileName) throw new Error('Geçersiz dosya URL\'i');

      const { error } = await supabase.storage
        .from('session-attachments')
        .remove([fileName]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Dosya silme hatası:', error);
      throw new Error(`Dosya silinirken hata oluştu: ${error.message}`);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Dosyaları yükle
      let attachmentUrls: string[] = [];
      if (newAttachments.length > 0) {
        attachmentUrls = await uploadFilesToSupabase(newAttachments);
      }
      
      // Şifreleme anahtarları oluştur
      const encryptionKey = await generateEncryptionKey();
      const iv = await generateIV();
      
      // İçeriği şifrele
      const encryptedContent = await encryptData(newNoteTitle, encryptionKey, iv);
      
      // Notu veritabanına ekle
      const { error } = await supabase.from('session_notes').insert({
        title: newNoteTitle,
        content: encryptedContent,
        encrypted_content: encryptedContent,
        encryption_key: encryptionKey,
        iv: iv,
        professional_id: professional?.id,
        client_id: clientId,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
      });

      if (error) throw error;

      // Başarılı mesajı göster
      setSuccessMessage('Not başarıyla eklendi.');
      setIsSuccessDialogOpen(true);
      
      // Formu temizle
      setNewNoteTitle('');
      newNoteEditor?.commands.clearContent();
      setNewAttachments([]);
      
      // Notları yeniden yükle
      await loadSessionNotes();
    } catch (error: any) {
      console.error('Error adding note:', error);
      setErrorMessage('Not eklenirken bir hata oluştu: ' + error.message);
      setIsErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditNote(e: React.FormEvent) {
    e.preventDefault();
    
    if (!professional) {
      setErrorMessage('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
      setIsErrorDialogOpen(true);
      return;
    }

    if (!editingNote) return;
    
    if (!editedNoteContent || editedNoteContent === '<p></p>') {
      setErrorMessage('Not içeriği boş olamaz.');
      setIsErrorDialogOpen(true);
      return;
    }

    try {
      setLoading(true);
      
      let attachmentUrls: string[] = [];
      
      // Mevcut dosyaları getir
      if (editingNote.attachments) {
        attachmentUrls = [...editingNote.attachments];
      }

      // Yeni dosyalar varsa yükle
      if (editAttachments.length > 0) {
        const newUrls = await uploadFilesToSupabase(editAttachments);
        attachmentUrls = [...attachmentUrls, ...newUrls];
      }
      
      // Silinen dosyaları Supabase'den kaldır
      if (removedAttachments.length > 0) {
        for (const url of removedAttachments) {
          await deleteFileFromSupabase(url);
        }
      }

      // Şifreleme anahtarları oluştur
      const encryptionKey = await generateEncryptionKey();
      const iv = await generateIV();

      // İçeriği şifrele
      const encryptedContent = await encryptData(editedNoteContent, encryptionKey, iv);
      
      // Güncellenmiş notu saklayalım
      const updatedNote = {
        ...editingNote,
        content: editedNoteContent,
        encrypted_content: encryptedContent,
        encryption_key: encryptionKey,
        iv: iv,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null
      };

      // Notu güncelle
      const { error } = await supabase
        .from('session_notes')
        .update({
          title: editingNote.title,
          content: editedNoteContent,
          encrypted_content: encryptedContent,
          encryption_key: encryptionKey,
          iv: iv,
          attachments: attachmentUrls.length > 0 ? attachmentUrls : null
        })
        .eq('id', editingNote.id);

      if (error) throw error;

      // Modalı kapat
      setIsEditDialogOpen(false);
      
      // Başarılı mesajı göster
      setSuccessMessage('Not başarıyla güncellendi.');
      setIsSuccessDialogOpen(true);
      
      // Notları yeniden yükle (kısa bir gecikme ile)
      setTimeout(async () => {
        await loadSessionNotes();
        // Düzenleme durumunu temizle
        setEditingNote(null);
        setEditedNoteContent('');
        setEditAttachments([]);
        setRemovedAttachments([]);
      }, 300);
      
    } catch (error: any) {
      console.error('Error updating note:', error);
      setErrorMessage('Not güncellenirken bir hata oluştu: ' + error.message);
      setIsErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNote() {
    if (!noteToDelete) return;
    
    try {
      setLoading(true);
      
      // Not silinmeden önce ilişkili tüm dosya eklerini de sil
      const { data: noteData, error: fetchError } = await supabase
        .from('session_notes')
        .select('attachments')
        .eq('id', noteToDelete)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (noteData && noteData.attachments && noteData.attachments.length > 0) {
        for (const url of noteData.attachments) {
          await deleteFileFromSupabase(url);
        }
      }
      
      const { error } = await supabase
        .from('session_notes')
        .delete()
        .eq('id', noteToDelete);

      if (error) throw error;

      // Başarılı mesajı göster
      setSuccessMessage('Not başarıyla silindi.');
      setIsSuccessDialogOpen(true);

      // Modalı kapat
      setIsDeleteDialogOpen(false);
      
      // Notları yeniden yükle
      await loadSessionNotes();

      // Silme durumunu temizle
      setNoteToDelete(null);
    } catch (error: any) {
      console.error('Error deleting note:', error);
      setErrorMessage('Not silinirken bir hata oluştu: ' + error.message);
      setIsErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }

  // Dosya yükleme işlevi
  async function handleFileUpload(
    files: FileList,
    isEditing: boolean = false
  ) {
    if (!files) return;

    const validFiles: File[] = [];
    
    // Dosya sayısı kontrolü
    const maxFiles = 5;
    const existingFilesCount = isEditing 
      ? (editingNote?.attachments?.length || 0) + editAttachments.length
      : files.length;
    
    // Toplam dosya sayısı kontrol ediliyor
    if (existingFilesCount + files.length > maxFiles) {
      setErrorMessage(`En fazla ${maxFiles} dosya ekleyebilirsiniz.`);
      setIsErrorDialogOpen(true);
      return;
    }
    
    // Tüm dosyaları kontrol et
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Dosya boyutu en fazla 5MB olabilir.');
        setIsErrorDialogOpen(true);
        continue;
      }
      
      // Dosya tipi kontrolü
      if (file.type.match('image/jpeg') || file.type.match('image/png') || file.type.match('image/gif') || file.type.match('application/pdf')) {
        validFiles.push(file);
        
        // Önizleme URL'i oluştur
        const url = URL.createObjectURL(file);
        if (isEditing) {
          setEditPreviewAttachments(prev => [...prev, url]);
        } else {
          setPreviewAttachments(prev => [...prev, url]);
        }
      } else {
        setErrorMessage('Sadece resim (JPEG, PNG, GIF) ve PDF dosyaları ekleyebilirsiniz.');
        setIsErrorDialogOpen(true);
      }
    }

    // Dosyaları state'e ekle
    if (isEditing) {
      setEditAttachments(prev => [...prev, ...validFiles]);
    } else {
      setNewAttachments(prev => [...prev, ...validFiles]);
    }
  }

  // Dosya silme işlevi
  function handleRemoveFile(index: number, isEditing: boolean = false) {
    if (isEditing) {
      const newFiles = [...editAttachments];
      const newPreviews = [...editPreviewAttachments];
      
      // Önizleme URL'ini temizle
      URL.revokeObjectURL(newPreviews[index]);
      
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
      
      setEditAttachments(newFiles);
      setEditPreviewAttachments(newPreviews);
    } else {
      const newFiles = [...newAttachments];
      const newPreviews = [...previewAttachments];
      
      // Önizleme URL'ini temizle
      URL.revokeObjectURL(newPreviews[index]);
      
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
      
      setNewAttachments(newFiles);
      setPreviewAttachments(newPreviews);
    }
  }

  return (
    <div className="space-y-6">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const submitEvent = e as unknown as { nativeEvent: { submitter: HTMLElement | null } };
          if (submitEvent.nativeEvent.submitter?.getAttribute('type') === 'submit') {
            handleAddNote(e);
          }
        }} 
        className="space-y-3 sm:space-y-4"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
            e.stopPropagation();
            if ((e.target as HTMLElement).closest('.ProseMirror')) {
              return;
            }
            e.preventDefault();
          }
        }}
      >
        <div className="relative">
          <input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
            placeholder="Not başlığı (opsiyonel)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
        </div>
        
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          
          <MenuBar editor={newNoteEditor} />
          <EditorContent editor={newNoteEditor} />
        </div>
        
        {/* Dosya yükleme alanı */}
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Dosya Ekle (Opsiyonel)
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              En fazla 5 dosya, her dosya en fazla 5MB
            </span>
          </div>
          
          <div className="flex items-center justify-center w-full">
            <label
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFileUpload(e.dataTransfer.files, false);
                }
              }}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Dosya yüklemek için tıklayın</span> veya sürükleyip bırakın
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF veya PDF
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files, false);
                    // Dosya seçildikten sonra input'u temizle ki aynı dosya tekrar seçilebilsin
                    e.target.value = '';
                  }
                }}
                accept="image/jpeg,image/png,image/gif,application/pdf" 
                multiple
              />
            </label>
          </div>
          
          {/* Yüklenen dosyaların önizlemesi */}
          {previewAttachments.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {previewAttachments.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-20 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    {url.includes('.pdf') ? (
                      <div className="flex items-center justify-center h-full w-full bg-red-50 dark:bg-red-900/20">
                        <span className="text-red-600 dark:text-red-400 text-sm font-medium">PDF</span>
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={loading || !newNoteEditor?.getHTML() || newNoteEditor?.getHTML() === '<p></p>'}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ekleniyor...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                Not Ekle
              </>
            )}
          </button>
        </div>
      </form>

      {/* Not düzenleme modalı - Standart Modal Tasarımı */}
      <Transition appear show={isEditDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsEditDialogOpen(false)}
          initialFocus={editDialogRef}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
            </Transition.Child>

            {/* Bu eleman tarayıcıların diyalog içeriğini dikey olarak ortalamalarına yardımcı olur */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-2xl p-4 sm:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <Dialog.Title className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4" ref={editDialogRef}>
                  Notu Düzenle
                </Dialog.Title>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const submitEvent = e as unknown as { nativeEvent: { submitter: HTMLElement | null } };
                    if (submitEvent.nativeEvent.submitter?.getAttribute('type') === 'submit') {
                      handleEditNote(e);
                    }
                  }}
                  className="space-y-4"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                      e.stopPropagation();
                      if ((e.target as HTMLElement).closest('.ProseMirror')) {
                        return;
                      }
                      e.preventDefault();
                    }
                  }}
                >
                  <input
                    type="text"
                    value={editingNote?.title || ''}
                    onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm sm:text-base"
                    placeholder="Not başlığı (opsiyonel)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                  
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    
                    <MenuBar editor={editNoteEditor} />
                    <EditorContent editor={editNoteEditor} />
                  </div>

                  {/* Dosya yükleme alanı - Düzenleme Formu */}
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dosya Ekle (Opsiyonel)
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        En fazla 5 dosya, her dosya en fazla 5MB
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center w-full">
                      <label
                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            handleFileUpload(e.dataTransfer.files, true);
                          }
                        }}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                          </svg>
                          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Dosya yüklemek için tıklayın</span> veya sürükleyip bırakın
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF veya PDF
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files) {
                              handleFileUpload(e.target.files, true);
                              // Dosya seçildikten sonra input'u temizle ki aynı dosya tekrar seçilebilsin
                              e.target.value = '';
                            }
                          }}
                          accept="image/jpeg,image/png,image/gif,application/pdf" 
                          multiple
                        />
                      </label>
                    </div>
                    
                    {/* Yüklenen dosyaların önizlemesi */}
                    {editPreviewAttachments.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mevcut Dosyalar
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {editPreviewAttachments.map((url, index) => (
                            <div key={`existing-${index}`} className="relative group">
                              <div className="relative h-20 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                {url.includes('.pdf') ? (
                                  <div className="flex items-center justify-center h-full w-full bg-red-50 dark:bg-red-900/20">
                                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">PDF</span>
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`Attachment ${index + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 group transition-all duration-200"
                                >
                                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Görüntüle</span>
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingNote) {
                                    // Dosyayı ekler listesinden çıkar
                                    const newAttachments = [...editingNote.attachments];
                                    const removedUrl = newAttachments.splice(index, 1)[0];
                                    
                                    // Daha sonra supabase'den silmek için kaldırılan URL'leri saklayın
                                    setRemovedAttachments(prev => [...prev, removedUrl]);
                                    
                                    // Notu güncelle
                                    setEditingNote({
                                      ...editingNote,
                                      attachments: newAttachments
                                    });
                                  }
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Yeni yüklenen dosyaların önizlemesi */}
                    {editAttachments.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Yeni Eklenecek Dosyalar
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {editAttachments.map((url, index) => (
                            <div key={`new-${index}`} className="relative group">
                              <div className="relative h-20 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                {url.includes('.pdf') ? (
                                  <div className="flex items-center justify-center h-full w-full bg-red-50 dark:bg-red-900/20">
                                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">PDF</span>
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`New Attachment ${index + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index, true)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200"
                      disabled={loading}
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || !editedNoteContent || editedNoteContent === '<p></p>'}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Kaydediliyor...
                        </>
                      ) : (
                        'Kaydet'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Not silme onay modalı - Standart Modal Tasarımı */}
      <Transition appear show={isDeleteDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsDeleteDialogOpen(false)}
          initialFocus={deleteDialogRef}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-4 sm:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <Dialog.Title className="text-lg font-medium text-red-600 dark:text-red-400 mb-4" ref={deleteDialogRef}>
                  Notu Sil
                </Dialog.Title>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200"
                    disabled={loading}
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteNote}
                    className="flex items-center px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Siliniyor...
                      </>
                    ) : (
                      'Sil'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Başarı modalı - Standart Modal Tasarımı */}
      <Transition appear show={isSuccessDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsSuccessDialogOpen(false)}
          initialFocus={successDialogRef}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <Dialog.Title className="text-lg font-medium text-green-600 dark:text-green-400 mb-2" ref={successDialogRef}>
                  Başarılı!
                </Dialog.Title>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {successMessage}
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsSuccessDialogOpen(false)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Tamam
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Hata modalı - Standart Modal Tasarımı */}
      <Transition appear show={isErrorDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsErrorDialogOpen(false)}
          initialFocus={errorDialogRef}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-sm p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <Dialog.Title className="text-lg font-medium text-red-600 dark:text-red-400 mb-2" ref={errorDialogRef}>
                  Hata
                </Dialog.Title>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {errorMessage}
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsErrorDialogOpen(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Tamam
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      
      {/* Notların listesi */}
      <div className="space-y-4">
        {sessionNotes.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-6 text-center border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
            <p className="text-gray-500 dark:text-gray-400">Henüz not eklenmemiş.</p>
          </div>
        ) : (
          sessionNotes.map((note) => (
            <div 
              key={note.id} 
              className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50/90 to-gray-100/90 dark:from-gray-700/90 dark:to-gray-800/90 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="mb-2 sm:mb-0">
                  {note.title && (
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {note.title}
                    </h3>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(note.created_at).toLocaleString('tr-TR', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </span>
                    {note.professional && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>{note.professional.full_name}</span>
                      </>
                    )}
                  </div>
                </div>
                {professional && note.professional_id === professional.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingNote(note);
                        setEditedNoteContent(note.content || '');
                        setIsEditDialogOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      aria-label="Düzenle"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setNoteToDelete(note.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Sil"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-6">
                <div 
                  className="prose prose-sm sm:prose max-w-none dark:prose-invert [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a:hover]:text-blue-700 dark:[&_a:hover]:text-blue-300 [&_ul]:list-disc [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:bg-gray-100 dark:[&_pre]:bg-gray-900 [&_pre]:p-2 [&_pre]:rounded"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};