import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash, 
  FileText,
  Plus,
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
  Loader2
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { 
  generateEncryptionKey, 
  generateIV, 
  encryptData, 
  decryptWithPrivateKey, 
  encryptWithPublicKey, 
  initializeKeyPair,
  encryptFile,
  decryptFile,
  retrieveKeyPair
} from '../../utils/encryption';

// import Image from 'next/image'; // Eğer kullanmıyorsak kaldıralım
// import { Button } from '../ui/button'; // Eğer kullanmıyorsak kaldıralım

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
  title: string;
  content: string;
  encrypted_content: string;
  client_public_key?: string;
  professional_id: string;
  professional?: {
    full_name: string;
  };
  client_id: string;
  created_at: string;
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

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    
    if (!professional) {
      setErrorMessage('Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.');
      setIsErrorDialogOpen(true);
      return;
    }
    
    if (!newNoteEditor || !newNoteEditor.getHTML() || newNoteEditor.getHTML() === '<p></p>') {
      setErrorMessage('Not içeriği boş olamaz.');
      setIsErrorDialogOpen(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // Anahtar çiftini başlat/getir
      const { publicKey } = await initializeKeyPair('session_notes');
      
      if (!publicKey) {
        throw new Error('Şifreleme anahtarları bulunamadı');
      }
      
      // Not içeriğini şifrele
      const noteContent = {
        title: newNoteTitle,
        content: newNoteEditor?.getHTML() || '',
        attachmentKeys: {} // Boş bir obje gönder
      };
      
      // İçeriği şifrele
      const { encryptedData, encryptedKey } = await encryptWithPublicKey(noteContent, publicKey);
      
      // Notu veritabanına ekle
      const { error } = await supabase.from('session_notes').insert({
        title: newNoteTitle,
        encrypted_content: encryptedData,
        client_public_key: encryptedKey,
        professional_id: professional?.id,
        client_id: clientId
        // attachments alanı veritabanında olmadığı için kaldırıldı
      });
      
      if (error) throw error;
      
      // Başarılı mesajı göster
      setSuccessMessage('Not başarıyla eklendi.');
      setIsSuccessDialogOpen(true);
      
      // Formu temizle
      setNewNoteTitle('');
      newNoteEditor?.commands.clearContent();
      
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
      
      // Anahtar çiftini başlat/getir
      const { publicKey, privateKey } = await initializeKeyPair('session_notes');
      
      if (!publicKey || !privateKey) {
        throw new Error('Şifreleme anahtarları bulunamadı');
      }
      
      // Not içeriğini şifrele
      const noteContent = {
        title: editingNote.title,
        content: editedNoteContent,
        attachmentKeys: {} // Boş bir obje gönder
      };
      
      // İçeriği şifrele
      const { encryptedData, encryptedKey } = await encryptWithPublicKey(noteContent, publicKey);
      
      // Notu güncelle
      const { error } = await supabase
        .from('session_notes')
        .update({
          title: editingNote.title,
          encrypted_content: encryptedData,
          client_public_key: encryptedKey
          // attachments alanı veritabanında olmadığı için kaldırıldı
        })
        .eq('id', editingNote.id);
      
      if (error) throw error;
      
      // Başarılı mesajı göster
      setSuccessMessage('Not başarıyla güncellendi.');
      setIsSuccessDialogOpen(true);
      
      // Modalı kapat
      setIsEditDialogOpen(false);
      
      // Notları yeniden yükle ve düzenleme durumunu temizle
      setTimeout(async () => {
        await loadSessionNotes();
        // Düzenleme durumunu temizle
        setEditingNote(null);
        setEditedNoteContent('');
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
      
      // Not veritabanından siliniyor
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
        className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-xl"
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border-b border-gray-200/70 dark:border-gray-700/70">
          <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Yeni Seans Notu
          </h3>
        </div>

        <div className="px-4 py-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
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
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <MenuBar editor={newNoteEditor} />
            <EditorContent editor={newNoteEditor} />
          </motion.div>
        </div>
        
        <div className="px-4 pb-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
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
          </motion.button>
        </div>
      </form>

      {/* Düzenleme Diyaloğu */}
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
              <Dialog.Panel className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dialog.Title className="text-xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Seans Notu Düzenle
                  </Dialog.Title>
                  <p className="text-center text-gray-500 dark:text-gray-400 mt-1 mb-4">
                    Danışanınız için seans notunu güncelleyin.
                  </p>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700 dark:text-gray-300">
                        Başlık (İsteğe Bağlı)
                      </label>
                      <input
                        value={editingNote?.title || ""}
                        onChange={(e) =>
                          setEditingNote((prev) => prev ? { ...prev, title: e.target.value } : null)
                        }
                        placeholder="Not başlığı"
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-medium text-gray-700 dark:text-gray-300">
                        Not İçeriği
                      </label>
                      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                        <MenuBar editor={editNoteEditor} />
                        <EditorContent editor={editNoteEditor} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 justify-end">
                    <button 
                      type="button"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                      İptal
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEditNote}
                      disabled={loading || !editedNoteContent || editedNoteContent === '<p></p>'}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                          Güncelleniyor
                        </>
                      ) : "Notu Güncelle"}
                    </motion.button>
                  </div>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Silme Onay Diyaloğu */}
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
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Dialog.Title className="text-xl font-medium text-center text-red-600 dark:text-red-500">
                    Seans Notunu Sil
                  </Dialog.Title>
                  <div className="mt-2 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Bu seans notunu silmek istediğinizden emin misiniz?
                      <br />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Bu işlem geri alınamaz.
                      </span>
                    </p>
                  </div>

                  <div className="mt-4 flex w-full justify-between sm:justify-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      className="flex-1 sm:flex-initial px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                      İptal
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteNote}
                      disabled={loading}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                          Siliniyor
                        </>
                      ) : "Evet, Sil"}
                    </motion.button>
                  </div>
                </motion.div>
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8 text-center border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
          >
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium text-lg mb-1">Henüz not eklenmemiş</p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Bu danışan için hiç seans notu bulunmuyor.</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                Seans Notları <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 py-0.5 px-2 rounded-full">
                  {sessionNotes.length}
                </span>
              </h3>
            </div>
            
            {sessionNotes.map((note, index) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100 
                }}
                className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:shadow-xl group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50/90 to-gray-100/90 dark:from-gray-700/90 dark:to-gray-800/90 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="mb-2 sm:mb-0">
                    {note.title ? (
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {note.title}
                      </h3>
                    ) : (
                      <h3 className="font-medium text-gray-400 dark:text-gray-500 italic">
                        İsimsiz Not
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
                  
                  <div className="flex space-x-1.5 sm:space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingNote(note);
                        setEditedNoteContent(note.content);
                        setIsEditDialogOpen(true);
                      }}
                      className="inline-flex items-center justify-center p-1.5 sm:p-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 rounded-lg border border-gray-200/70 dark:border-gray-600/70 shadow-sm transition-all duration-200 hover:shadow-md"
                      aria-label="Not Düzenle"
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note.id);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="inline-flex items-center justify-center p-1.5 sm:p-2 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 rounded-lg border border-gray-200/70 dark:border-gray-600/70 shadow-sm transition-all duration-200 hover:shadow-md"
                      aria-label="Not Sil"
                    >
                      <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5">
                  <div 
                    className="prose prose-sm sm:prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};