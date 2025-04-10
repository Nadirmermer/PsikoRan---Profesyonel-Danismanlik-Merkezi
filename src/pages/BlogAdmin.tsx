import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import {
  Plus,
  Edit2,
  Trash2,
  EyeOff,
  Eye,
  Calendar,
  BookOpen,
  Tag,
  Clock,
  Info,
  AlertCircle,
  Loader2,
  Check,
  X,
  Bold,
  Italic,
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
  Underline as UnderlineIcon,
  Edit,
  Trash,
  ArrowLeft,
  User,
  Image as ImageIcon
} from 'lucide-react';
import slugify from 'slugify';
import { BlogPost as BlogPostType, formatBlogDate } from '../lib/blog';

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  is_published: boolean;
  reading_time: number;
  cover_image?: string;
}

// Admin tarafında kullanılan BlogPost türü (string veya string[] olarak tags kabul edebilir)
interface BlogPost extends Omit<BlogPostType, 'tags'> {
  tags: string[] | string;
  created_at: string;
  updated_at: string;
}

// MenuBar bileşeni
interface MenuBarProps {
  editor: any;
  onImageUpload: (file: File) => Promise<string>;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onImageUpload }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // Görsel yükleme işlevi
  const handleImageUpload = async (e: React.MouseEvent) => {
    // Tıklama olayını durdur
    e.preventDefault();
    
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) return;
        
        // 5MB dosya boyutu kontrolü
        if (file.size > 5 * 1024 * 1024) {
          alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
          return;
        }
        
        // İzin verilen dosya tipleri
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Sadece JPG, PNG, GIF ve WEBP formatları desteklenir.');
          return;
        }
        
        setIsUploading(true);
        
        try {
          const imageUrl = await onImageUpload(file);
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error: any) {
          console.error('Görsel yükleme hatası:', error);
          alert(`Görsel yüklenirken bir hata oluştu: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Görsel seçme hatası:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-1.5 sm:p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
      {/* Metin Formatları */}
      <div className="flex flex-wrap gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <div className="relative">
          <button
            type="button"
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
            type="button"
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
            type="button"
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
      </div>

      {/* Başlıklar */}
      <div className="flex flex-wrap gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <div className="relative">
          <button
            type="button"
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
            type="button"
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
            type="button"
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
            type="button"
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
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('code') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Kod"
            onMouseEnter={() => showTooltip('code')}
            onMouseLeave={hideTooltip}
          >
            <Code className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('code') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'code' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Kod
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('highlight') ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Vurgu"
            onMouseEnter={() => showTooltip('highlight')}
            onMouseLeave={hideTooltip}
          >
            <Highlighter className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('highlight') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'highlight' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Vurgu
            </div>
          )}
        </div>
      </div>

      {/* Görsel ekle butonu - alttaki butonun ardına ekle */}
      <div className="flex flex-wrap gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <div className="relative">
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={isUploading}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              isUploading ? 'opacity-50' : ''
            }`}
            title="Görsel Ekle"
            onMouseEnter={() => showTooltip('image')}
            onMouseLeave={hideTooltip}
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-white animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 dark:text-white" />
            )}
          </button>
          {activeTooltip === 'image' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Görsel Ekle
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const categories = [
  { value: 'psikoloji', label: 'Psikoloji' },
  { value: 'terapi', label: 'Terapi' },
  { value: 'klinik-psikoloji', label: 'Klinik Psikoloji' },
  { value: 'saglik', label: 'Sağlık' },
  { value: 'cocuk-gelisimi', label: 'Çocuk Gelişimi' },
  { value: 'egitim', label: 'Eğitim' },
  { value: 'danismanlik', label: 'Danışmanlık' },
  { value: 'online-terapi', label: 'Online Terapi' }
];

// ReadTime bileşeni - okuma süresini göstermek için tutarlı bir bileşen
interface ReadTimeProps {
  minutes: number;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const ReadTime: React.FC<ReadTimeProps> = ({ 
  minutes, 
  className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
  iconClassName = "h-3 w-3 mr-1",
  textClassName = ""
}) => {
  const displayMinutes = minutes || 5;
  
  return (
    <span className={className}>
      <Clock className={iconClassName} />
      <span className={textClassName}>{displayMinutes} dk</span>
    </span>
  );
};

// Editör için blog görseli stilleri
const blogImageStyles = `
  .ProseMirror img.blog-image {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }
  
  .ProseMirror .selectedImage {
    outline: 2px solid #3b82f6;
  }
`;

export function BlogAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    tags: '',
    is_published: true,
    reading_time: 0,
    cover_image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // Kullanıcı tipi ve bağlı uzmanlar
  const [userType, setUserType] = useState<'professional' | 'assistant' | 'admin' | 'regular'>('regular');
  const [linkedProfessionals, setLinkedProfessionals] = useState<any[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  // Özel kategori seçimi için state
  const [customCategory, setCustomCategory] = useState<string>('');

  // TipTap editör ayarları
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Placeholder.configure({
        placeholder: 'Blog içeriğini buraya yazın...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
    ],
    content: formData.content || '',
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getHTML()
      }));
    },
  });

  // Editör içeriğini güncelle (düzenleme modunda)
  useEffect(() => {
    if (editor && editingPost) {
      editor.commands.setContent(editingPost.content || '');
    }
  }, [editor, editingPost]);

  useEffect(() => {
    fetchPosts();
    
    // Kullanıcı bilgilerini alarak yazar adını otomatik doldur
    if (user) {
      const getUserMetadata = async () => {
        // Önce kullanıcının admin olup olmadığını kontrol et
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id, full_name, title')
          .eq('user_id', user.id)
          .single();
        
        if (adminData) {
          // Kullanıcı bir admin
          setUserType('admin');
          
          const authorName = adminData.title 
            ? `${adminData.title} ${adminData.full_name}` 
            : adminData.full_name;
          
          setFormData(prev => ({
            ...prev,
            author: authorName
          }));
          return;
        }
        
        // Önce kullanıcının uzman olup olmadığını kontrol et
        const { data: profileData, error: profileError } = await supabase
          .from('professionals')
          .select('id, full_name, title')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          // Kullanıcı bir ruh sağlığı uzmanı
          setUserType('professional');
          setSelectedProfessionalId(profileData.id);
          
          const authorName = profileData.title 
            ? `${profileData.title} ${profileData.full_name}` 
            : profileData.full_name;
          
          setFormData(prev => ({
            ...prev,
            author: authorName
          }));
        } else {
          // Kullanıcı bir asistan olabilir
          const { data: assistantData } = await supabase
            .from('assistants')
            .select('id, full_name')
            .eq('user_id', user.id)
            .single();
            
          if (assistantData) {
            setUserType('assistant');
            
            // Asistanın bağlı olduğu uzmanları bul
            const { data: linkedProfs } = await supabase
              .from('professionals')
              .select('id, full_name, title')
              .eq('assistant_id', assistantData.id);
              
            if (linkedProfs && linkedProfs.length > 0) {
              setLinkedProfessionals(linkedProfs);
              // Varsayılan olarak ilk uzmanı seç
              setSelectedProfessionalId(linkedProfs[0].id);
              
              // Yazar adını bağlı uzmanın adı olarak ayarla
              const prof = linkedProfs[0];
              const authorName = prof.title 
                ? `${prof.title} ${prof.full_name}` 
                : prof.full_name;
                
            setFormData(prev => ({
              ...prev,
                author: authorName
            }));
            }
          }
        }
      };
      
      getUserMetadata();
    }
  }, [user]);

  const fetchPosts = async () => {
    setIsLoading(true);
    
    try {
      // Kullanıcı türüne göre farklı sorgular yapılandır
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (userType === 'admin') {
        // Admin kullanıcıları tüm blog yazılarını görebilir veya
        // sadece kendilerinin yazdıklarını görmek isterlerse:
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          // Eğer adminin sadece kendi yazılarını görmesini istiyorsanız:
          // query = query.eq('author_id', userData.user.id);
          
          // Eğer adminin tüm yazıları görmesini istiyorsanız, query'de değişiklik yapılmaz
        }
      } else if (userType === 'professional') {
        // Ruh sağlığı uzmanları sadece kendi blog yazılarını görebilir
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          query = query.eq('author_id', userData.user.id);
        }
      } else if (userType === 'assistant') {
        // Asistanlar yalnızca bağlı oldukları ruh sağlığı uzmanlarının blog yazılarını görebilir
        if (linkedProfessionals.length > 0) {
          // Bağlı uzmanların user_id'lerini alıyoruz
          const professionalUserIds = await Promise.all(
            linkedProfessionals.map(async (prof) => {
              const { data } = await supabase
                .from('professionals')
                .select('user_id')
                .eq('id', prof.id)
                .single();
              return data?.user_id;
            })
          );
          
          // Null olmayan user_id'leri filtreleyelim
          const validUserIds = professionalUserIds.filter(id => id);
          
          if (validUserIds.length > 0) {
            query = query.in('author_id', validUserIds);
          }
        }
      }
      
      const { data, error: fetchError } = await query;
        
      if (fetchError) throw fetchError;
      
      setPosts(data || []);
    } catch (err) {
      console.error('Blog yazıları yüklenirken hata oluştu:', err);
      setError('Blog yazıları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  const resetForm = () => {
    // Temel form alanlarını sıfırla
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: '',
      category: '',
      tags: '',
      is_published: true,
      reading_time: 0,
      cover_image: ''
    });
    
    // Eğer asistan ise ve bağlı uzmanlar varsa, varsayılan olarak ilk uzmanı seç
    if (userType === 'assistant' && linkedProfessionals.length > 0) {
      setSelectedProfessionalId(linkedProfessionals[0].id);
      
      // Yazar adını da ayarla
      const prof = linkedProfessionals[0];
      const authorName = prof.title 
        ? `${prof.title} ${prof.full_name}` 
        : prof.full_name;
        
      setFormData(prev => ({
        ...prev,
        author: authorName
      }));
    } else if (userType === 'professional' && selectedProfessionalId) {
      // Profesyonel ise kendi adını korur
      // Not: Bu alanlar zaten useEffect ile yükleniyor, bu yüzden ekstra bir şey yapmaya gerek yok
    }
    
    setEditingPost(null);
    if (editor) {
      editor.commands.setContent('');
    }
  };

  // Dosya adını temizleme (güvenli hale getirme) fonksiyonu
  const sanitizeFileName = (fileName: string): string => {
    // Uzantıyı koruyarak temizle
    const lastDot = fileName.lastIndexOf('.');
    const ext = lastDot !== -1 ? fileName.substring(lastDot) : '';
    const nameWithoutExt = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
    
    // Türkçe karakterleri ve boşlukları değiştir
    let sanitized = nameWithoutExt
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[üÜ]/g, 'u')
      .replace(/[çÇ]/g, 'c')
      .replace(/[şŞ]/g, 's')
      .replace(/[ıİ]/g, 'i')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[öÖ]/g, 'o');
    
    // Sadece alfanumerik, nokta, alt çizgi ve tire karakterlerini koru
    sanitized = sanitized.replace(/[^a-z0-9._-]/g, '');
    
    // Uzantıyı ekle ve döndür
    return sanitized + ext;
  };
  
  // Görsel yükleme fonksiyonu
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Dosya tipini kontrol et
      console.log('Yüklenen dosya tipi:', file.type);
      console.log('Dosya boyutu:', file.size, 'bytes');
      
      // İzin verilen dosya tiplerini kontrol et
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Desteklenmeyen dosya tipi: ${file.type}. Sadece JPG, PNG, GIF ve WEBP formatları desteklenir.`);
      }

      // Benzersiz bir dosya adı oluştur
      const timestamp = new Date().getTime();
      const sanitizedName = sanitizeFileName(file.name);
      const fileName = `blog-images/${timestamp}-${sanitizedName}`;
      
      // Supabase token ve URL bilgilerini al
      const { data: authData } = await supabase.auth.getSession();
      const token = authData?.session?.access_token;
      
      if (!token) {
        throw new Error('Oturum bulunamadı, lütfen tekrar giriş yapın');
      }
      
      // FormData oluştur
      const formData = new FormData();
      formData.append('file', file);
      
      // Supabase storage URL'ini oluştur
      const supabaseUrl = 'https://hjfmevurucynhmdbxacd.supabase.co';
      const storageUrl = `${supabaseUrl}/storage/v1/object/blog/${fileName}`;
      
      // Dosyayı fetch API ile yükle
      const uploadResponse = await fetch(storageUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('Yükleme yanıtı:', errorData);
        throw new Error(`Görsel yüklenemedi: ${errorData.error || errorData.message || 'Bilinmeyen hata'}`);
      }
      
      // Public URL'i oluştur
      const { data: publicUrlData } = await supabase.storage
        .from('blog')
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Görsel URL\'i alınamadı');
      }

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Görsel yükleme işlemi başarısız:', error);
      throw error;
    }
  };

  // Görsel önizleme bileşenini güncelle
  const ImagePreview: React.FC<{ src: string; onError: () => void }> = ({ src, onError }) => {
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    const handleImageError = () => {
      if (retryCount < maxRetries) {
        // URL'ye timestamp ekleyerek yeniden dene
        const timestamp = new Date().getTime();
        const newSrc = src.includes('?') 
          ? `${src}&t=${timestamp}`
          : `${src}?t=${timestamp}`;
        
        const imgElement = document.querySelector(`img[src^="${src.split('?')[0]}"]`) as HTMLImageElement;
        if (imgElement) {
          imgElement.src = newSrc;
        }
        setRetryCount(prev => prev + 1);
      } else {
        console.log('Görsel yüklenemedi, maksimum yeniden deneme sayısına ulaşıldı.');
        onError();
      }
    };

    return (
      <img
        src={src}
        alt="Önizleme"
        className="w-full h-full object-cover rounded-lg"
        onError={handleImageError}
        loading="lazy"
      />
    );
  };

  // Okuma süresi hesaplama fonksiyonu - uygulama genelinde tutarlılık sağlar
  function calculateReadingTime(content: string): number {
    if (!content) return 5; // Varsayılan değer 5 dk
    
    // HTML etiketlerini temizle
    const text = content.replace(/<[^>]*>/g, '');
    
    // Türkçe ortalama okuma hızı: 200 kelime/dakika
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    
    return minutes;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Kullanıcı bilgisini al
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');

      // İçerik kontrolü
      const editorContent = editor?.getHTML() || '';
      if (!editorContent || editorContent === '<p></p>') {
        throw new Error('İçerik boş olamaz, lütfen bir içerik girin.');
      }

      // Okuma süresini içerik uzunluğuna göre hesapla
      const readingTime = calculateReadingTime(editorContent);

      // Yazar ID'sini belirle
      let author_id = data.user.id;
      
      if (userType === 'assistant' && selectedProfessionalId) {
        const selectedProfData = await supabase
          .from('professionals')
          .select('user_id')
          .eq('id', selectedProfessionalId)
          .single();
        
        if (selectedProfData.data?.user_id) {
          author_id = selectedProfData.data.user_id;
        }
      } else if (userType === 'admin') {
        // Admin kullanıcıları için author_id olarak kendi user_id'leri kullanılır
        author_id = data.user.id;
      }

      // Slug kontrolü
      const slugValue = formData.slug || generateSlug(formData.title);

      // Blog verisini hazırla
      const saveData = {
        title: formData.title,
        slug: slugValue,
        excerpt: formData.excerpt,
        content: editorContent,
        cover_image: formData.cover_image || null, // Kapak fotoğrafı varsa kullan, yoksa null
        author: formData.author,
        author_id,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        is_published: formData.is_published,
        reading_time: readingTime, // Otomatik hesaplanmış okuma süresi
        published_at: formData.is_published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      if (formMode === 'edit' && editingPost) {
        // Mevcut blog yazısını güncelle
        const { error } = await supabase
          .from('blog_posts')
          .update(saveData)
          .eq('id', editingPost.id);

        if (error) throw new Error(`Blog yazısı güncellenirken hata oluştu: ${error.message}`);
        
        setSuccessMessage('Blog yazısı başarıyla güncellendi!');
      } else {
        // Yeni blog yazısı ekle
        const { error } = await supabase
          .from('blog_posts')
          .insert([saveData]);

        if (error) throw new Error(`Blog yazısı eklenirken hata oluştu: ${error.message}`);
        
        setSuccessMessage('Blog yazısı başarıyla eklendi!');
      }

      resetForm();
      setShowForm(false);
      fetchPosts(); // Listeyi güncelle
      
    } catch (error: any) {
      console.error('Blog yazısı kaydedilirken hata:', error);
      setErrorMessage(error.message || 'Blog yazısı kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleDeletePost(postId: string) {
    if (!window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
        
      if (deleteError) throw deleteError;
      
      setSuccessMessage('Blog yazısı başarıyla silindi.');
      fetchPosts();
      
    } catch (err: any) {
      console.error('Blog yazısı silinirken hata oluştu:', err);
      setError('Blog yazısı silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditPost = (post: BlogPost) => {
    setFormMode('edit');
    setEditingPost(post);
    
    // Post içeriğini forma yükle
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : typeof post.tags === 'string' ? post.tags : '',
      is_published: post.is_published,
      reading_time: post.reading_time || 0,
      cover_image: post.cover_image || ''  // Kapak fotoğrafını da yükle
    });
    
    // Eğer asistan kullanıcısıysa, düzenlenen yazının yazarına göre professional seçimini yap
    if (userType === 'assistant' && linkedProfessionals.length > 0) {
      // Yazarın adını kullanarak uygun uzmanı bul
      const matchingProfessional = linkedProfessionals.find(prof => {
        const profName = prof.title 
          ? `${prof.title} ${prof.full_name}` 
          : prof.full_name;
        return post.author.includes(prof.full_name);
      });
      
      if (matchingProfessional) {
        setSelectedProfessionalId(matchingProfessional.id);
      } else {
        // Eşleşen profesyonel bulunamazsa ilk profesyoneli seç
        setSelectedProfessionalId(linkedProfessionals[0].id);
      }
    }
    
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // Form verisini hazırla
  const prepareFormData = () => {
    const tags = formData.tags 
      ? formData.tags.split(',').map(tag => tag.trim()) 
      : [];

    return {
      title: formData.title,
      slug: formData.slug || slugify(formData.title, { lower: true, strict: true }),
      excerpt: formData.excerpt,
      content: formData.content,
      author: formData.author,
      category: formData.category,
      tags: tags,
      is_published: formData.is_published ?? true,
      reading_time: formData.reading_time || 0,
      published_at: formData.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
  };

  useEffect(() => {
    // Blog görselleri için stil ekle
    const styleEl = document.createElement('style');
    styleEl.innerHTML = blogImageStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      // Component unmount olduğunda stil elementini temizle
      document.head.removeChild(styleEl);
    };
  }, []);

  // Kapak fotoğrafı yükleme işlevi
  const handleCoverImageUpload = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) return;
        
        // 5MB dosya boyutu kontrolü
        if (file.size > 5 * 1024 * 1024) {
          alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
          return;
        }
        
        // İzin verilen dosya tipleri
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('Sadece JPG, PNG, GIF ve WEBP formatları desteklenir.');
          return;
        }
        
        setIsUploadingCover(true);
        
        try {
          const imageUrl = await uploadImage(file);
          setFormData(prev => ({ ...prev, cover_image: imageUrl }));
        } catch (error: any) {
          console.error('Kapak görseli yükleme hatası:', error);
          alert(`Kapak görseli yüklenirken bir hata oluştu: ${error.message}`);
        } finally {
          setIsUploadingCover(false);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Görsel seçme hatası:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Üst Kısım - Geri Butonu ve Sayfa Başlığı */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Blog Yönetimi</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {userType === 'professional' 
                  ? 'Kendi blog yazılarınızı yönetin.' 
                  : userType === 'assistant' 
                    ? 'Bağlı uzmanların blog yazılarını yönetin.' 
                    : 'Blog yazılarını yönetin.'}
              </p>
            </div>
          </div>
        <button
          onClick={() => {
              setFormMode('create');
              setEditingPost(null);
            resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
              Yeni Yazı
        </button>
      </div>

      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
          >
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage(null)}
                className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
            >
                <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

        {showForm ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white group flex items-center">
                {formMode === 'create' ? 'Yeni Blog Yazısı' : 'Blog Yazısını Düzenle'}
                  {formMode === 'edit' && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      Düzenleniyor
                    </span>
                  )}
              </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {userType === 'professional' 
                    ? 'Bu yazı sizin adınıza yayınlanacak.' 
                    : userType === 'assistant' && linkedProfessionals.length > 0
                      ? 'Yazının yayınlanacağı ruh sağlığı uzmanını seçin.' 
                      : userType === 'admin'
                        ? 'Admin olarak blog içeriği ekleyebilir ve düzenleyebilirsiniz.'
                        : ''}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Önizle
                </button>
              <button
                onClick={() => setShowForm(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/20 text-red-700 dark:text-red-400 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Başlık ve Slug */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Başlık <span className="text-red-500">*</span>
                  </label>
            <input
              type="text"
                    name="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (!editingPost) {
                  setFormData(prev => ({
                    ...prev,
                          slug: generateSlug(e.target.value)
                  }));
                }
              }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                            focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm"
                    required
                    placeholder="Yazının başlığını girin"
            />
          </div>

                {/* Kapak Fotoğrafı */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Kapak Fotoğrafı
                  </label>
                  
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-40 h-32 relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      {formData.cover_image ? (
                        <>
                          <img 
                            src={formData.cover_image}
                            alt="Kapak fotoğrafı"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/assets/images/blog-placeholder.jpg';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                            title="Görseli kaldır"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">Kapak yok</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleCoverImageUpload}
                        disabled={isUploadingCover}
                        className={`px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                                text-slate-800 dark:text-slate-200 rounded-lg flex items-center text-sm transition-colors
                                ${isUploadingCover ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                      >
                        {isUploadingCover ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Kapak Fotoğrafı Yükle
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Önerilen: 1200x630 piksel, maksimum boyut: 5MB
                      </p>
                    </div>
                  </div>
                </div>
          
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const slugFieldset = document.getElementById('slug-fieldset');
                        if (slugFieldset) {
                          slugFieldset.classList.toggle('hidden');
                        }
                      }}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                    >
                      <span>URL Ayarlarını Göster/Gizle</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                
                  <fieldset id="slug-fieldset" className="hidden space-y-2 mt-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <legend className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">SEO URL Ayarları</legend>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Slug (URL)
                  </label>
                  <div className="flex items-center">
            <input
              type="text"
                      name="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                                focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm"
                          placeholder="url-adresi-burada"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                      className="ml-2 px-3 py-2 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200 
                                rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors text-sm"
                    >
                          Otomatik Oluştur
                    </button>
                  </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Blog yazısı adresi. Boş bırakırsanız başlıktan otomatik üretilir.
                      </p>
                    </div>
                  </fieldset>
                </div>
          </div>
          
              {/* Kısa Açıklama */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Kısa Açıklama <span className="text-red-500">*</span>
                </label>
            <textarea
                  name="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                            bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                          focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm"
                  required
                  placeholder="Yazınızın kısa bir özetini yazın (blog listesinde görünecek)"
            />
          </div>
          
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                {/* Yazar - Sadece asistanlar için göster */}
                {userType === 'assistant' && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Yazar <span className="text-red-500">*</span>
                  </label>
                    <div>
                      <select
                        value={selectedProfessionalId || ''}
                        onChange={(e) => {
                          const profId = e.target.value;
                          setSelectedProfessionalId(profId);
                          
                          const selectedProf = linkedProfessionals.find(p => p.id === profId);
                          if (selectedProf) {
                            const authorName = selectedProf.title 
                              ? `${selectedProf.title} ${selectedProf.full_name}` 
                              : selectedProf.full_name;
                            
                            setFormData(prev => ({
                              ...prev,
                              author: authorName
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm"
                    required
                      >
                        <option value="">-- Uzman Seçin --</option>
                        {linkedProfessionals.map(prof => (
                          <option key={prof.id} value={prof.id}>
                            {prof.title ? `${prof.title} ${prof.full_name}` : prof.full_name}
                          </option>
                        ))}
                      </select>
                      {!selectedProfessionalId && (
                        <p className="mt-1 text-xs text-red-500">Bir uzman seçmelisiniz</p>
                      )}
          </div>
                  </div>
                )}
                
                {/* Kategori */}
                <div className={`space-y-1 ${userType === 'assistant' ? '' : 'md:col-span-2'}`}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                            focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm"
                      required={formData.category !== 'custom'}
                    >
                      <option value="">-- Kategori Seçin --</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                      <option value="custom">Yeni Kategori Ekle</option>
                    </select>

                    {formData.category === 'custom' && (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setFormData(prev => ({ ...prev, category: e.target.value }));
                        }}
                        placeholder="Yeni kategori"
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                                bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                                focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm"
                    required
                  />
                    )}
                  </div>
          </div>
          
                {/* Etiketler */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Etiketler (virgülle ayırın)
                  </label>
            <input
              type="text"
                    name="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Örn: Psikoloji, Danışmanlık, Terapi"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                            focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent shadow-sm"
                  />
                </div>
          </div>
          
              {/* Yayın Durumu */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Yayın Durumu
                  </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <input
                      type="radio"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={() => setFormData({ ...formData, is_published: true })}
                      className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 
                                text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Hemen Yayınla</span>
                  </label>
                  <label className="inline-flex items-center px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <input
                      type="radio"
                      name="is_published"
                      checked={!formData.is_published}
                      onChange={() => setFormData({ ...formData, is_published: false })}
                      className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 
                                text-primary-600 focus:ring-primary-500 mr-2"
            />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Taslak Olarak Kaydet</span>
            </label>
                </div>
          </div>
          
              {/* İçerik Editörü */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  İçerik <span className="text-red-500">*</span>
                </label>
                {editor && <MenuBar editor={editor} onImageUpload={uploadImage} />}
                <div 
                  className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg 
                            min-h-[500px] bg-white dark:bg-slate-700 prose prose-sm max-w-none
                                prose-slate dark:prose-invert focus:ring-2 focus:ring-primary-500 
                            dark:focus:ring-primary-400 focus:border-transparent overflow-y-auto shadow-sm"
                  onClick={() => editor?.commands.focus()}
                >
                  <EditorContent editor={editor} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  İçerik uzunluğuna göre okuma süresi otomatik hesaplanacaktır.
                </p>
              </div>

              {/* Form Butonları */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                    resetForm();
                setShowForm(false);
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 
                          hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              İptal
            </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                          dark:hover:bg-primary-600 text-white rounded-lg transition-colors
                            flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 
                          focus:ring-primary-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : formMode === 'create' ? (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Yazı Ekle
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Güncelle
                    </>
                  )}
                </button>
          </div>
        </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                  <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Blog Yazıları</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {userType === 'professional' 
                        ? 'Sadece sizin yazdığınız blog yazılarını görüntülüyorsunuz.' 
                        : userType === 'assistant' 
                          ? 'Sadece bağlı olduğunuz ruh sağlığı uzmanlarının blog yazılarını görüntülüyorsunuz.' 
                          : userType === 'admin'
                            ? 'Admin olarak tüm blog yazılarını görüntüleyebilir ve yönetebilirsiniz.'
                            : ''}
                    </p>
                  </div>
              <div className="flex items-center space-x-2">
            <button
                  onClick={() => fetchPosts()}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Yenile"
            >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-slate-600 dark:text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
            </button>
          </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 text-primary-600 dark:text-primary-400 animate-spin" />
              </div>
            ) : posts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map(post => (
                      <motion.div 
                        key={post.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-none overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col h-full transition-all duration-200"
                      >
                        {/* Görsel kısmı */}
                        <div className="w-full h-40 relative bg-slate-200 dark:bg-slate-700">
                          {post.cover_image ? (
                            <img 
                              src={post.cover_image} 
                              alt={post.title || 'Blog yazısı görseli'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Görsel yüklenemezse varsayılan simgeyi göster
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              post.is_published 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                            }`}>
                              {post.is_published ? 'Yayında' : 'Taslak'}
                            </span>
                          </div>
                        </div>
                        
                        {/* İçerik kısmı */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-3">
                            {post.excerpt}
                          </p>
                          
                          <div className="mt-auto">
                            <div className="flex flex-wrap gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                              {post.category}
                            </span>
                              <ReadTime minutes={post.reading_time} />
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                                {formatBlogDate(post.published_at || post.created_at).split(" ").slice(0, 2).join(" ")}
                              </div>
                              <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[120px]">{post.author}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* İşlem butonları */}
                        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              post.is_published 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' 
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400'
                            }`}>
                              {post.is_published ? 'Yayında' : 'Taslak'}
                        </div>
                      </div>
                          <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditPost(post)}
                              className="inline-flex items-center p-1.5 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-700 transition-colors"
                              title="Düzenle"
                        >
                              <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                              className="inline-flex items-center p-1.5 rounded-md text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-slate-700 transition-colors"
                              title="Sil"
                        >
                              <Trash2 className="h-4 w-4" />
                        </button>
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center p-1.5 rounded-md text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-slate-700 transition-colors"
                              title="Görüntüle"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                      </div>
                    </div>
                      </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">Henüz Blog Yazısı Bulunmuyor</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  İlk blog yazınızı ekleyerek başlayın.
                </p>
                <button
                  onClick={() => {
                    setFormMode('create');
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Yeni Yazı Ekle
                </button>
              </div>
            )}
              </div>
            </div>
        </div>
      )}
      </div>

      {/* Önizleme Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            onClick={() => setShowPreview(false)}
          />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Önizleme: {formData.title || 'Başlıksız Yazı'}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-grow">
              {/* Başlık */}
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {formData.title || 'Başlıksız Yazı'}
              </h1>
              
              <div className="flex items-center space-x-3 mb-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date().toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                {formData.reading_time && (
                  <ReadTime 
                    minutes={formData.reading_time}
                    className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
                    iconClassName="h-3.5 w-3.5 mr-1.5"
                  />
                )}
                {formData.category && (
                  <div className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                    {formData.category}
                  </div>
                )}
              </div>
              
              {formData.excerpt && (
                <div className="mb-8">
                  <div className="text-lg italic text-slate-700 dark:text-slate-300 font-medium border-l-4 border-primary-500 pl-4">
                    {formData.excerpt}
                  </div>
                </div>
              )}

              {/* Kapak görseli */}
              {formData.cover_image && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={formData.cover_image}
                    alt={formData.title || 'Blog kapak görseli'}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/images/blog-placeholder.jpg';
                    }}
                  />
                </div>
              )}
              
              <div className="prose prose-slate max-w-none dark:prose-invert
                prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-p:text-slate-600 dark:prose-p:text-slate-300
                prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:font-medium
                prose-img:rounded-lg prose-img:shadow-lg
                prose-ul:text-slate-600 dark:prose-ul:text-slate-300
                prose-ol:text-slate-600 dark:prose-ol:text-slate-300
                prose-blockquote:border-l-primary-600 dark:prose-blockquote:border-l-primary-400
                prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-200
                prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/20
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-code:text-slate-900 dark:prose-code:text-slate-200
                prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                {editor && <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />}
              </div>
              
              {formData.author && (
                <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 mr-3">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {formData.author}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Ruh Sağlığı Uzmanı
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                          dark:hover:bg-primary-600 text-white rounded-lg transition-colors
                          flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 
                          focus:ring-primary-500 dark:focus:ring-offset-slate-800 shadow-sm"
              >
                Düzenlemeye Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 