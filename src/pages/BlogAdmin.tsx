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
  User
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
  reading_time?: number;
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
            onClick={() => {
              if (showLinkInput) {
                setShowLinkInput(false);
              } else {
                setShowLinkInput(true);
              }
            }}
            className={`p-1.5 sm:p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('link') || showLinkInput ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            title="Bağlantı"
            onMouseEnter={() => showTooltip('link')}
            onMouseLeave={hideTooltip}
          >
            <LinkIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              editor.isActive('link') || showLinkInput ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-white'
            }`} />
          </button>
          {activeTooltip === 'link' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Bağlantı
            </div>
          )}
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700 flex items-center min-w-[250px]">
              <input
                type="text"
                placeholder="Bağlantı URL'si"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setLink();
                    e.preventDefault();
                  }
                }}
                className="flex-1 p-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={setLink}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Uygula"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    if (editor.isActive('link')) {
                      removeLink();
                    }
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Kaldır/İptal"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
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

export function BlogAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    tags: '',
    is_published: true,
    reading_time: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

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
        const { data: profileData, error: profileError } = await supabase
          .from('professionals')
          .select('full_name, title')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          const authorName = profileData.title 
            ? `${profileData.full_name}, ${profileData.title}` 
            : profileData.full_name;
          
          setFormData(prev => ({
            ...prev,
            author: authorName
          }));
        } else {
          const { data: assistantData } = await supabase
            .from('assistants')
            .select('full_name')
            .eq('user_id', user.id)
            .single();
            
          if (assistantData) {
            setFormData(prev => ({
              ...prev,
              author: assistantData.full_name
            }));
          }
        }
      };
      
      getUserMetadata();
    }
  }, [user]);

  const fetchPosts = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPosts(data || []);
    } catch (err) {
      console.error('Blog yazıları yüklenirken hata oluştu:', err);
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
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: '',
      category: '',
      tags: '',
      is_published: true,
      reading_time: 0
    });
    setImagePreview('');
    setImageFile(null);
    setEditingPost(null);
    if (editor) {
      editor.commands.setContent('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const postData = prepareFormData();
      let imageUrl = editingPost?.cover_image || '/assets/images/blog/default-post.jpg';

      // Görsel yükleme işlemi varsa
      if (imageFile) {
        // Önce eski görseli sil (düzenleme durumunda)
        if (editingPost?.cover_image && editingPost.cover_image !== '/assets/images/blog/default-post.jpg') {
          const oldImagePath = editingPost.cover_image.split('/').pop();
          if (oldImagePath) {
            const { error: deleteError } = await supabase.storage
              .from('blog_images')
              .remove([oldImagePath]);
            
            if (deleteError) {
              console.error('Eski görsel silinirken hata oluştu:', deleteError);
            }
          }
        }

        // Yeni görseli yükle
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog_images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error(`Görsel yüklenirken hata oluştu: ${uploadError.message}`);
        }

        const { data: urlData } = await supabase.storage
          .from('blog_images')
          .getPublicUrl(fileName);

        if (urlData) {
          imageUrl = urlData.publicUrl;
        }
      }

      // Blog yazısını güncelle veya yeni oluştur
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...postData,
            cover_image: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        setSuccessMessage('Blog yazısı başarıyla güncellendi.');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([{
            ...postData,
            cover_image: imageUrl,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        setSuccessMessage('Blog yazısı başarıyla oluşturuldu.');
      }

      // Formu sıfırla
      resetForm();
      setShowForm(false);
      
      // Blog yazılarını yeniden yükle
      fetchPosts();
    } catch (err: any) {
      console.error('Blog yazısı kaydedilirken hata oluştu:', err);
      setErrorMessage(err.message || 'Blog yazısı kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
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
      
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
        
      if (error) throw error;
      
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
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : typeof post.tags === 'string' ? post.tags : '',
      is_published: post.is_published,
      reading_time: post.reading_time || 0
    });
    setImagePreview(post.cover_image);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Görsel önizlemeyi temizleme fonksiyonu
  const clearImagePreview = () => {
    setImagePreview('');
    setImageFile(null);
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Üst başlık - Sticky */}
      <div className="sticky top-0 z-40 w-full bg-primary-600/90 dark:bg-primary-800/90 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/blog')}
              className="mr-3 p-2 hover:bg-white/20 rounded-full transition-colors duration-200 text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Blog Yönetimi</h1>
          </div>
        <button
          onClick={() => {
              setFormMode('create');
              setEditingPost(null);
            resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-white text-primary-700 hover:bg-primary-50 rounded-lg font-medium flex items-center transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
              Yeni Yazı
        </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{errorMessage}</span>
            <button 
              onClick={() => setErrorMessage(null)}
                className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
            >
                <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

        {showForm ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {formMode === 'create' ? 'Yeni Blog Yazısı' : 'Blog Yazısını Düzenle'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Başlık
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
                    slug: slugify(e.target.value.toLowerCase(), { lower: true, strict: true })
                  }));
                }
              }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                    required
            />
          </div>
          
          <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Slug (URL)
                  </label>
                  <div className="flex items-center">
            <input
              type="text"
                      name="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                                bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                                focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                      className="ml-2 px-3 py-2 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-200 
                                rounded hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                    >
                      Oluştur
                    </button>
                  </div>
                </div>
          </div>
          
          <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kısa Açıklama
                </label>
            <textarea
                  name="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                            bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                            focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  required
            />
          </div>
          
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Yazar
                  </label>
              <input
              type="text"
                    name="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                    required
            />
          </div>
          
          <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                    required
                  />
          </div>
          
          <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Etiketler (virgülle ayırın)
                  </label>
            <input
              type="text"
                    name="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="örn: Psikoloji, Danışmanlık, Terapi"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
          </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Okuma Süresi (dakika)
                  </label>
            <input
              type="number"
                    name="reading_time"
              value={formData.reading_time}
              onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) })}
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                              bg-white dark:bg-slate-700 text-slate-900 dark:text-white 
                              focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
                  <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
                      name="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600 
                                text-primary-600 focus:ring-primary-500 mr-2"
            />
              Yayınla
            </label>
                </div>
          </div>
          
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kapak Görseli
                </label>
                <div className="flex items-start space-x-4">
                  <div className="flex-grow">
                    <label className="block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 
                                    border-dashed rounded-md text-center cursor-pointer
                                    hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="text-slate-500 dark:text-slate-400">
                        <div className="flex justify-center">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                        </div>
                        <div className="mt-1 text-sm">
                          {imageFile ? imageFile.name : 'Görsel yüklemek için tıklayın veya sürükleyin'}
                        </div>
                      </div>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Önizleme"
                        className="w-full h-full object-cover rounded-md shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  İçerik
                </label>
                {editor && <MenuBar editor={editor} />}
                <div className="mt-2 p-4 border border-slate-300 dark:border-slate-600 rounded-md 
                                min-h-[300px] bg-white dark:bg-slate-700 prose prose-sm max-w-none
                                prose-slate dark:prose-invert focus:ring-2 focus:ring-primary-500 
                                dark:focus:ring-primary-400 focus:border-transparent overflow-y-auto">
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                    resetForm();
                setShowForm(false);
                  }}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 
                            dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              İptal
            </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                            dark:hover:bg-primary-600 text-white rounded-md transition-colors
                            flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 
                            focus:ring-primary-500 disabled:opacity-50"
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Blog Yazıları</h2>
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
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {posts.map(post => (
                    <div key={post.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div className="flex-1">
                          <h4 className="text-lg font-medium text-slate-900 dark:text-white">{post.title}</h4>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">{post.excerpt}</p>
                          <div className="mt-2 flex items-center flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                              {post.category}
                            </span>
                            <span className="inline-flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatBlogDate(post.published_at || post.created_at)}
                            </span>
                            <span className="inline-flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {post.author}
                            </span>
                            <span className={`inline-flex items-center ${
                              post.is_published 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {post.is_published ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                              {post.is_published ? 'Yayında' : 'Taslak'}
                            </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0 sm:ml-4 flex">
                        <button
                          onClick={() => handleEditPost(post)}
                            className="inline-flex items-center mr-2 p-1.5 border border-transparent rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Düzenle</span>
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                            className="inline-flex items-center p-1.5 border border-transparent rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Sil</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
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
      )}
      </div>
    </div>
  );
} 