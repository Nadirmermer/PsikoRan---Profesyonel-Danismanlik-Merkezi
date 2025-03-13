import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AVAILABLE_TESTS } from '../data/tests';
import { useAuth } from '../lib/auth';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import {
  Check,
  Share,
  Trash,
  Edit,
  Download,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Check as CheckIcon,
  X as XIcon,
  Plus,
  Search as SearchIcon,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { generateEncryptionKey, generateIV, encryptData, decryptData } from '../utils/encryption';
import { Question } from '../data/tests/types';
import { generateTestPDF } from '../utils/generateTestPDF';
import '@fontsource/roboto';

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
  professional?: {
    full_name: string;
  };
}

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  notes?: string;
  session_fee: number;
  professional_share_percentage: number;
  clinic_share_percentage: number;
  professional_id: string;
  professional?: {
    id: string;
    full_name: string;
    title?: string;
    email: string;
    phone?: string;
    clinic_name?: string;
    assistant_id?: string;
  };
}

interface TestResult {
  id: string;
  client_id: string;
  test_type: string;
  score: number;
  answers: Record<string, any>;
  created_at: string;
  professional_id: string;
  notes?: string;
  encrypted_answers?: string;
  encryption_key?: string;
  iv?: string;
}

type TabType = 'details' | 'appointments' | 'notes' | 'tests' | 'test-results';
type TestCategory = 'anxiety' | 'depression' | 'personality' | 'other';

interface TestType {
  id: string;
  name: string;
  category: TestCategory;
}

type UserRole = 'professional' | 'assistant';

const TABS = [
  { id: 'details' as TabType, name: 'Danışan Bilgileri', showTo: ['professional', 'assistant'] as UserRole[] },
  { id: 'appointments' as TabType, name: 'Randevular', showTo: ['professional', 'assistant'] as UserRole[] },
  { id: 'notes' as TabType, name: 'Seans Notları', showTo: ['professional'] as UserRole[] },
  { id: 'tests' as TabType, name: 'Testler', showTo: ['professional'] as UserRole[] },
  { id: 'test-results' as TabType, name: 'Test Sonuçları', showTo: ['professional'] as UserRole[] }
] as const;

// Test kategorileri
const TEST_CATEGORIES = [
  { id: 'depression', name: 'Depresyon Testleri', tests: ['beck-depression', 'edinburgh'] },
  { id: 'anxiety', name: 'Anksiyete Testleri', tests: ['beck-anxiety', 'child-social-anxiety'] },
  { id: 'personality', name: 'Kişilik ve Tanı Testleri', tests: ['scid-5-cv', 'scid-5-pd', 'scid-5-spq'] },
  { id: 'other', name: 'Diğer Testler', tests: ['beck-hopelessness', 'beck-suicide', 'ytt40', 'scl90r'] }
];

// classNames yardımcı fonksiyonu
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// TipTap Editör Ayarları
interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700' : ''
        }`}
      >
        <AlignRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { professional, assistant } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [activeEditor, setActiveEditor] = useState<any>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTestList, setShowTestList] = useState(false);
  const [selectedTest, setSelectedTest] = useState<typeof AVAILABLE_TESTS[0] | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<string, any>>({});
  const [testNotes, setTestNotes] = useState('');
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [searchTest, setSearchTest] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareOptions, setShareOptions] = useState<{ name: string; url?: string; action?: () => void; icon: string; description: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // TipTap editörleri
  const newNoteEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Not içeriğini buraya yazın...',
      }),
      Highlight,
      TextStyle,
      Color,
    ],
    content: newNoteContent,
    onUpdate: ({ editor }) => {
      setNewNoteContent(editor.getHTML());
    },
  });

  const editNoteEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Not içeriğini buraya yazın...',
      }),
      Highlight,
      TextStyle,
      Color,
    ],
    content: editNoteContent,
    onUpdate: ({ editor }) => {
      setEditNoteContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editNoteEditor && editingNote) {
      editNoteEditor.commands.setContent(editingNote.content || '');
      setEditNoteContent(editingNote.content || '');
    }
  }, [editingNote, editNoteEditor]);

  useEffect(() => {
    loadClient();
    loadSessionNotes();
    loadAppointments();
    loadTestResults();
  }, [id]);

  async function loadClient() {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          professional:professionals!inner(
            id,
            full_name,
            title,
            email,
            phone,
            assistant_id,
            assistant:assistants(
              id,
              clinic_name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (clientError) throw clientError;

      if (clientData?.professional?.assistant) {
        clientData.professional.clinic_name = clientData.professional.assistant.clinic_name;
      }

      setClient(clientData);
      setFormData(clientData);
    } catch (error) {
      console.error('Error loading client:', error);
      setErrorMessage('Danışan bilgileri yüklenirken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadSessionNotes() {
    try {
      const { data: notes, error } = await supabase
        .from('session_notes')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const decryptedNotes = await Promise.all(
        notes.map(async (note) => {
          try {
            if (note.encrypted_content && note.encryption_key && note.iv) {
              const decryptedContent = await decryptData(
                note.encrypted_content,
                note.encryption_key,
                note.iv
              );
              return { ...note, content: decryptedContent };
            }
            return note;
          } catch (error) {
            console.error('Error decrypting note:', error);
            return { ...note, content: 'Not içeriği okunamadı.' };
          }
        })
      );

      setSessionNotes(decryptedNotes);
    } catch (error) {
      console.error('Error loading session notes:', error);
    }
  }

  async function loadAppointments() {
    try {
      const now = new Date().toISOString();
      
      // Past appointments
      const { data: pastData, error: pastError } = await supabase
        .from('appointments')
        .select('*, professional:professionals(*), room:rooms(*)')
        .eq('client_id', id)
        .lt('start_time', now)
        .order('start_time', { ascending: false });

      if (pastError) throw pastError;
      setPastAppointments(pastData || []);

      // Upcoming appointments
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('appointments')
        .select('*, professional:professionals(*), room:rooms(*)')
        .eq('client_id', id)
        .gte('start_time', now)
        .order('start_time', { ascending: true });

      if (upcomingError) throw upcomingError;
      setUpcomingAppointments(upcomingData || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }

  async function loadTestResults() {
    try {
      const { data: results, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Şifrelenmiş cevapları çöz
      const decryptedResults = await Promise.all(
        (results || []).map(async (result) => {
          try {
            if (result.encrypted_answers && result.encryption_key && result.iv) {
              const decryptedAnswers = await decryptData(
                result.encrypted_answers,
                result.encryption_key,
                result.iv
              );
              return { ...result, answers: decryptedAnswers };
            }
            return result;
          } catch (error) {
            console.error('Error decrypting test answers:', error);
            return { ...result, answers: {} };
          }
        })
      );

      setTestResults(decryptedResults);
    } catch (error) {
      console.error('Error loading test results:', error);
    }
  }

  async function handleSubmitTest() {
    if (!professional || !selectedTest) return;

    try {
      const score = selectedTest.calculateScore(testAnswers);
      const interpretation = selectedTest.interpretScore(score);
      
      // Şifreleme anahtarları oluştur
      const key = generateEncryptionKey();
      const iv = generateIV();

      // Test cevaplarını şifrele
      const encryptedAnswers = await encryptData(testAnswers, key, iv);

      const { error } = await supabase
        .from('test_results')
        .insert({
          client_id: id,
          professional_id: professional.id,
          test_type: selectedTest.id,
          score,
          answers: testAnswers,
          encrypted_answers: encryptedAnswers,
          encryption_key: key,
          iv: iv,
          notes: testNotes || null
        });

      if (error) throw error;

      setShowTestDialog(false);
      setSelectedTest(null);
      setTestAnswers({});
      setTestNotes('');
      await loadTestResults();
    } catch (error) {
      console.error('Error submitting test:', error);
      setErrorMessage('Test sonuçları kaydedilirken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    }
  }

  async function handleDeleteResult(resultId: string) {
    try {
      const { error } = await supabase
        .from('test_results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;
      await loadTestResults();
    } catch (error) {
      console.error('Error deleting test result:', error);
      setErrorMessage('Test sonucu silinirken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    }
  }

  function handleDownloadResult(result: TestResult) {
    const test = AVAILABLE_TESTS.find(t => t.id === result.test_type);
    if (!test || !client || !professional) return;

    const pdfDoc = generateTestPDF(test, result, client, professional);
    
    // PDF'i indir
    const fileName = `${(test.name || '')
      .replace(/[şŞıİğĞüÜöÖçÇ]/g, (match: string) => {
        const replacements: { [key: string]: string } = {
          'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I',
          'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
          'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
        };
        return replacements[match] || match;
      })} - ${(client.full_name || '')
      .replace(/[şŞıİğĞüÜöÖçÇ]/g, (match: string) => {
        const replacements: { [key: string]: string } = {
          'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I',
          'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
          'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
        };
        return replacements[match] || match;
      })} - ${new Date(result.created_at).toLocaleDateString('tr-TR')}.pdf`;
    
    pdfDoc.save(fileName);
  }

  function handleAnswerChange(questionId: string, value: any) {
    const newAnswers = {
      ...testAnswers,
      [questionId]: value
    };
    setTestAnswers(newAnswers);

    // Son soru cevaplandıysa testi otomatik olarak tamamla
    if (selectedTest && Object.keys(newAnswers).length === selectedTest.questions.length) {
      handleSubmitTest();
    }
  }

  async function handleUpdateClient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      await loadClient();
      setEditMode(false);
      alert('Danışan bilgileri başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Danışan bilgileri güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!professional) return;

    if (!newNoteContent || newNoteContent === '<p></p>') {
      setErrorMessage('Not içeriği boş olamaz.');
      setIsErrorDialogOpen(true);
      return;
    }

    try {
      const key = generateEncryptionKey();
      const iv = generateIV();
      const encryptedContent = await encryptData(newNoteContent, key, iv);

      const { error } = await supabase
        .from('session_notes')
        .insert({
          client_id: id,
          professional_id: professional.id,
          title: newNoteTitle || null,
          content: newNoteContent,
          encrypted_content: encryptedContent,
          encryption_key: key,
          iv: iv
        });

      if (error) throw error;

      setNewNoteContent('');
      setNewNoteTitle('');
      await loadSessionNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      setErrorMessage('Not eklenirken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    }
  }

  async function handleEditNote(e: React.FormEvent) {
    e.preventDefault();
    if (!professional || !editingNote) return;

    if (!editNoteContent || editNoteContent === '<p></p>') {
      setErrorMessage('Not içeriği boş olamaz.');
      setIsErrorDialogOpen(true);
      return;
    }

    try {
      const key = generateEncryptionKey();
      const iv = generateIV();
      const encryptedContent = await encryptData(editNoteContent, key, iv);

      const { error } = await supabase
        .from('session_notes')
        .update({
          title: editingNote.title,
          content: editNoteContent,
          encrypted_content: encryptedContent,
          encryption_key: key,
          iv: iv
        })
        .eq('id', editingNote.id)
        .eq('professional_id', professional.id);

      if (error) throw error;

      setIsEditDialogOpen(false);
      setEditingNote(null);
      setEditNoteContent('');
      if (editNoteEditor) {
        editNoteEditor.commands.setContent('');
      }
      await loadSessionNotes();
      
      setSuccessMessage('Not başarıyla güncellendi.');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error updating note:', error);
      setErrorMessage('Not güncellenirken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    }
  }

  async function handleDeleteNote() {
    if (!noteToDelete || !professional) return;

    try {
      const { error } = await supabase
        .from('session_notes')
        .delete()
        .eq('id', noteToDelete)
        .eq('professional_id', professional.id)
        .eq('client_id', id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
      await loadSessionNotes();
      
      setSuccessMessage('Not başarıyla silindi.');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error deleting note:', error);
      setErrorMessage('Not silinirken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    }
  }

  // Testleri filtrele
  const filteredTests = useMemo(() => {
    return AVAILABLE_TESTS.filter(test => 
      test.name.toLowerCase().includes(searchTest.toLowerCase())
    );
  }, [searchTest]);

  // Kategorize edilmiş testler
  const categorizedTests = useMemo(() => {
    return TEST_CATEGORIES.map(category => ({
      ...category,
      tests: category.tests
        .map(testId => AVAILABLE_TESTS.find(t => t.id === testId))
        .filter(test => test && test.name.toLowerCase().includes(searchTest.toLowerCase()))
    }));
  }, [searchTest]);

  // Kullanıcı rolüne göre sekmeleri filtrele
  const visibleTabs = useMemo(() => {
    const userRole: UserRole = professional ? 'professional' : 'assistant';
    return TABS.filter(tab => tab.showTo.includes(userRole));
  }, [professional]);

  // Test token oluşturma fonksiyonu
  async function generateTestToken(testId: string) {
    try {
      console.log("=== DEBUG: generateTestToken started ===");
      console.log("testId:", testId);
      console.log("clientId:", id);
      
      if (!professional?.id || !id) {
        throw new Error('Professional ID ve Client ID gerekli');
      }
      
      // Güvenli bir token oluştur
      const timestamp = new Date().getTime();
      const secretKey = import.meta.env.VITE_TEST_TOKEN_SECRET_KEY;
      
      if (!secretKey) {
        throw new Error('TEST_TOKEN_SECRET_KEY environment variable is not set');
      }
      
      // Token için string oluştur (format: testId:clientId:professionalId:timestamp:hash)
      const dataToHash = `${testId}:${id}:${professional.id}:${timestamp}`;
      const tokenData = `${dataToHash}:${secretKey}`;
      
      // Base64 kodlama
      const token = btoa(tokenData);
      
      console.log("Generated secure token:", token);
      
      // Token nesnesini oluştur
      const tokenObject = {
        test_id: testId,
        client_id: id,
        professional_id: professional.id,
        token: token,
        created_at: new Date().toISOString(),
        expires_at: new Date(timestamp + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 gün geçerli
      };

      // Token'ı veritabanına kaydet
      const { data: savedToken, error: saveError } = await supabase
        .from('test_tokens')
        .insert(tokenObject)
        .select()
        .single();

      if (saveError) {
        console.error("Token kaydetme hatası:", saveError);
        throw saveError;
      }
      
      console.log("Token saved to database:", savedToken);
      console.log("=== DEBUG: generateTestToken completed ===");
      
      return savedToken;
    } catch (error) {
      console.error('Error in generateTestToken:', error);
      throw error;
    }
  }

  // Test paylaşım fonksiyonu
  async function handleShareTest(testId: string) {
    try {
      console.log("=== DEBUG: handleShareTest started ===");
      console.log("Test paylaşımı başlatılıyor, testId:", testId, "clientId:", id);
      
      // Önce mevcut token'ları kontrol et
      console.log("Checking existing tokens...");
      const { data: existingTokens, error: tokenCheckError } = await supabase
        .from('test_tokens')
        .select('*')
        .eq('test_id', testId)
        .eq('client_id', id);
      
      if (tokenCheckError) {
        console.error('Error checking existing tokens:', tokenCheckError);
        throw tokenCheckError;
      }
      
      console.log("Existing tokens:", existingTokens);
      
      // Geçerli bir token varsa onu kullan, yoksa yeni oluştur
      let token;
      if (existingTokens && existingTokens.length > 0) {
        // En son oluşturulan token'ı al
        const latestToken = existingTokens.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        // Token'ın oluşturulma tarihini kontrol et (24 saat geçerli)
        const tokenDate = new Date(latestToken.created_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60);
        
        console.log("Latest token:", latestToken);
        console.log("Token age in hours:", hoursDiff);
        
        if (hoursDiff <= 24) {
          // Token hala geçerli, bunu kullan
          token = latestToken;
          console.log("Using existing valid token:", token);
        } else {
          // Token süresi dolmuş, yeni oluştur
          console.log("Token expired, generating new one...");
          token = await generateTestToken(testId);
          console.log("New token generated:", token);
        }
      } else {
        // Hiç token yok, yeni oluştur
        console.log("No existing tokens, generating new one...");
        token = await generateTestToken(testId);
        console.log("New token generated:", token);
      }

      if (!token) {
        throw new Error('Failed to generate test token');
      }

      console.log("Token oluşturuldu:", token);

      const test = AVAILABLE_TESTS.find(t => t.id === testId);
      if (!test) {
        throw new Error('Test not found');
      }

      // Paylaşım linkini oluştur
      const shareUrl = `${window.location.origin}/test/${testId}/${id}/${token.token}`;
      
      // Profesyonel mesaj metni oluştur
      const messageTitle = `${test.name} - ${professional?.full_name || 'Ruh Sağlığı Uzmanı'}`;
      const messageBody = `Sayın danışanımız,\n\n` +
        `${professional?.full_name} tarafından size "${test.name}" testi gönderilmiştir.\n\n` +
        `Testi tamamlamak için aşağıdaki güvenli bağlantıyı kullanabilirsiniz:\n\n` +
        `${shareUrl}\n\n` +
        `Not: Bu link sadece size özeldir ve 24 saat içinde geçerliliğini yitirecektir. Lütfen başkalarıyla paylaşmayınız.\n\n` +
        `Saygılarımızla,\n` +
        `${professional?.full_name}\n` +
        `${professional?.title || 'Ruh Sağlığı Uzmanı'}`;
      
      // Paylaşım seçeneklerini döndür
      const options = [];

      if (!client) {
        throw new Error('Client data is not available');
      }

      // WhatsApp seçeneği (telefon varsa)
      if (client?.phone) {
        const phoneNumber = client.phone.replace(/[^0-9]/g, '');
        options.push({
          name: 'WhatsApp',
          url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageBody)}`,
          icon: '📱',
          description: 'WhatsApp üzerinden güvenli test linkini gönderin'
        });

        // SMS seçeneği
        options.push({
          name: 'SMS',
          url: `sms:${phoneNumber}?body=${encodeURIComponent(messageBody)}`,
          icon: '💬',
          description: 'SMS ile test linkini iletin'
        });
      }

      // E-posta seçeneği (e-posta varsa)
      if (client?.email) {
        options.push({
          name: 'E-posta',
          url: `mailto:${client.email}?subject=${encodeURIComponent(messageTitle)}&body=${encodeURIComponent(messageBody)}`,
          icon: '📧',
          description: 'E-posta ile resmi test davetiyesi gönderin'
        });
      }

      // Her zaman linki kopyalama seçeneği ekle
      options.push({
        name: 'Linki Kopyala',
        action: async () => {
          await navigator.clipboard.writeText(shareUrl);
          setSuccessMessage('Test linki başarıyla kopyalandı!');
          setIsSuccessDialogOpen(true);
        },
        icon: '📋',
        description: 'Test linkini panoya kopyalayın'
      });

      setShareOptions(options);
      setIsShareModalOpen(true);
    } catch (error) {
      console.error('Error sharing test:', error);
      setErrorMessage('Test paylaşım linki oluşturulurken bir hata oluştu.');
      setIsErrorDialogOpen(true);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Danışan bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {visibleTabs.map((tab) => (
          <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200'
              )}
            >
              {tab.name}
            </button>
          ))}
          </nav>
        </div>

      {/* Tab içerikleri */}
      {activeTab === 'details' && (
            <div className="space-y-6">
              {!editMode ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Ad Soyad
                      </h3>
                      <p className="text-base text-gray-900 dark:text-white">
                        {client.full_name}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        E-posta
                      </h3>
                      <p className="text-base text-gray-900 dark:text-white">
                        {client.email}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Telefon
                      </h3>
                      <p className="text-base text-gray-900 dark:text-white">
                        {client.phone || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Doğum Tarihi
                      </h3>
                      <p className="text-base text-gray-900 dark:text-white">
                        {client.birth_date || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Seans Ücreti
                      </h3>
                      <p className="text-base text-gray-900 dark:text-white">
                        {client.session_fee.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Ruh Sağlığı Uzmanı
                      </h3>
                      <p className="text-base text-gray-900 dark:text-white">
                        {client.professional?.full_name || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Notlar
                    </h3>
                    <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                      {client.notes || '-'}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Düzenle
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdateClient} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={formData.full_name || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        E-posta
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Doğum Tarihi
                      </label>
                      <input
                        type="date"
                        value={formData.birth_date || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, birth_date: e.target.value })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Seans Ücreti
                      </label>
                      <input
                        type="number"
                        value={formData.session_fee || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            session_fee: Number(e.target.value),
                          })
                        }
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notlar
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                  Gelecek Randevular
                </h3>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
                      >
                        <div>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {new Date(appointment.start_time).toLocaleString('tr-TR', {
                              dateStyle: 'long',
                              timeStyle: 'short',
                            })}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {appointment.professional.full_name}
                            {appointment.room && ` - ${appointment.room.name}`}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {appointment.status === 'scheduled' && 'Planlandı'}
                          {appointment.status === 'completed' && 'Tamamlandı'}
                          {appointment.status === 'cancelled' && 'İptal Edildi'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400">
                      Gelecek randevu bulunmuyor.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                  Geçmiş Randevular
                </h3>
                {pastAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {pastAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
                      >
                        <div>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            {new Date(appointment.start_time).toLocaleString('tr-TR', {
                              dateStyle: 'long',
                              timeStyle: 'short',
                            })}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {appointment.professional.full_name}
                            {appointment.room && ` - ${appointment.room.name}`}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {appointment.status === 'scheduled' && 'Planlandı'}
                          {appointment.status === 'completed' && 'Tamamlandı'}
                          {appointment.status === 'cancelled' && 'İptal Edildi'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400">
                      Geçmiş randevu bulunmuyor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && professional && (
            <div className="space-y-6">
              <form onSubmit={handleAddNote} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Not başlığı (opsiyonel)"
                  />
                </div>
                
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <MenuBar editor={newNoteEditor} />
                  <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-4">
                    <EditorContent editor={newNoteEditor} />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={!newNoteContent || newNoteContent === '<p></p>'}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Not Ekle
                  </button>
                </div>
              </form>

              {/* Not düzenleme modalı */}
              <Dialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                className="fixed inset-0 z-50 overflow-y-auto"
              >
                <div className="flex items-center justify-center min-h-screen p-4">
                  <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" aria-hidden="true" />

                  <div className="relative bg-white/90 dark:bg-gray-800/90 rounded-2xl max-w-2xl w-full p-6 shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                    <Dialog.Title className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                      Notu Düzenle
                    </Dialog.Title>

                    <form onSubmit={handleEditNote} className="space-y-4">
                      <input
                        type="text"
                        value={editingNote?.title || ''}
                        onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Not başlığı (opsiyonel)"
                      />
                      
                      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <MenuBar editor={editNoteEditor} />
                        <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 p-4">
                          <EditorContent editor={editNoteEditor} />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setIsEditDialogOpen(false)}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!editNoteContent || editNoteContent === '<p></p>'}
                        >
                          Kaydet
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog>
              
              {/* Notların listesi */}
              <div className="space-y-4">
                {sessionNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50/90 to-gray-100/90 dark:from-gray-700/90 dark:to-gray-800/90 border-b border-gray-200/50 dark:border-gray-700/50">
                      <div>
                        {note.title && (
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {note.title}
                          </h3>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(note.created_at).toLocaleString('tr-TR', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                          })}
                        </div>
                      </div>
                      {note.professional_id === professional.id && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingNote(note);
                              setEditNoteContent(note.content || '');
                              setIsEditDialogOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setNoteToDelete(note.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div 
                        className="prose dark:prose-invert max-w-none [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a:hover]:text-blue-700 dark:[&_a:hover]:text-blue-300 [&_ul]:list-disc [&_ol]:list-decimal"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

      {activeTab === 'tests' && professional && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Testler</h2>
            <div className="relative">
                    <input
                      type="text"
                placeholder="Test ara..."
                value={searchTest}
                onChange={(e) => setSearchTest(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    </div>
            </div>

          <div className="space-y-8">
            {categorizedTests.map(category => (
              <div key={category.id} className="space-y-4">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">{category.name}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.tests.map(test => test && (
                    <div
                      key={test.id}
                      className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                    >
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{test.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{test.description}</div>
                        <div className="flex justify-end space-x-2 mt-4">
                                                   {/* SCID-5-CV ve SCID-5-PD testleri için paylaşım butonu gösterme */}
                                                   {test.id !== 'scid-5-cv' && test.id !== 'scid-5-pd' && (

                            <button
                              onClick={async () => {
                                await handleShareTest(test.id);
                              }}
                              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              Paylaş
                            </button>
                          )}
                          <button
                            onClick={() => {
                              window.open(`/test/${test.id}/${id}`, '_blank');
                            }}
                            className="px-3 py-1.5 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
                          >
                            Testi Başlat
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'test-results' && professional && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Test Sonuçları</h2>
          </div>

          <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {testResults.map((result) => {
                const test = AVAILABLE_TESTS.find(t => t.id === result.test_type);
                return (
                  <li key={result.id}>
                    <div className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                              {test?.name || result.test_type}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                              {test?.interpretScore?.(result.score) || `Puan: ${result.score}`}
                            </span>
                    </div>
                          <div className="flex space-x-3">
                      <button
                        type="button"
                              onClick={() => handleDownloadResult(result)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                              <Download className="mr-1.5 h-4 w-4" />
                              İndir
                      </button>
                      <button
                              type="button"
                              onClick={() => handleDeleteResult(result.id)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-100 dark:bg-red-900 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                              <Trash className="mr-1.5 h-4 w-4" />
                              Sil
                      </button>
                    </div>
            </div>
                  <div className="mt-2">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="mr-1.5 h-4 w-4" />
                            {new Date(result.created_at).toLocaleString('tr-TR', {
                              dateStyle: 'long',
                              timeStyle: 'short'
                            })}
                  </div>
                  </div>
            </div>
          </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Test Dialog */}
      {showTestDialog && selectedTest && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {selectedTest.name}
              </h2>
              <button
                onClick={() => {
                  if (Object.keys(testAnswers).length > 0) {
                    setShowExitWarning(true);
                  } else {
                    setShowTestDialog(false);
                    setSelectedTest(null);
                    setTestAnswers({});
                    setTestNotes('');
                    setCurrentQuestionIndex(0);
                  }
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {showIntro ? (
              <div className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p>{selectedTest.description}</p>
                  {selectedTest.instructions && (
                    <>
                      <h3>Yönerge</h3>
                      <p>{selectedTest.instructions}</p>
                    </>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowIntro(false)}
                    className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Teste Başla
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Soru {currentQuestionIndex + 1} / {selectedTest.questions.length}
                  </div>
                  <div className="h-2 flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / selectedTest.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div key={selectedTest.questions[currentQuestionIndex].id} className="space-y-4">
                  <p className="text-lg text-gray-900 dark:text-white">
                    {currentQuestionIndex + 1}. {selectedTest.questions[currentQuestionIndex].text}
                  </p>
                  <div className="space-y-2">
                    {selectedTest.questions[currentQuestionIndex].options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={selectedTest.questions[currentQuestionIndex].id}
                          value={option.value}
                          checked={testAnswers[selectedTest.questions[currentQuestionIndex].id] === option.value}
                          onChange={() => handleAnswerChange(selectedTest.questions[currentQuestionIndex].id, option.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-gray-900 dark:text-white">
                          {option.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {currentQuestionIndex === selectedTest.questions.length - 1 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notlar (Opsiyonel)
                    </label>
                    <textarea
                      value={testNotes}
                      onChange={(e) => setTestNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Test ile ilgili notlarınızı buraya yazabilirsiniz..."
                    />
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200 disabled:opacity-50"
                  >
                    Önceki Soru
                  </button>
                  
                  {currentQuestionIndex === selectedTest.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitTest}
                      disabled={Object.keys(testAnswers).length !== selectedTest.questions.length}
                      className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      Testi Tamamla
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(selectedTest.questions.length - 1, prev + 1))}
                      disabled={!testAnswers[selectedTest.questions[currentQuestionIndex].id]}
                      className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      Sonraki Soru
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exit Warning Dialog */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Testten Çık
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Testten çıkmak istediğinize emin misiniz? Verdiğiniz tüm cevaplar silinecektir.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExitWarning(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  setShowExitWarning(false);
                  setShowTestDialog(false);
                  setSelectedTest(null);
                  setTestAnswers({});
                  setTestNotes('');
                }}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200"
              >
                Testten Çık
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paylaşım Seçenekleri Modal */}
      <Dialog
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          <div className="relative bg-white/90 dark:bg-gray-800/90 rounded-2xl max-w-lg w-full p-6 shadow-xl backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Testi Paylaş
              </Dialog.Title>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {client?.full_name} için test paylaşım yöntemi seçin:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    if (option.action) {
                      option.action();
                    } else if (option.url) {
                      window.open(option.url, '_blank');
                    }
                    setIsShareModalOpen(false);
                  }}
                  className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                    {option.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Not: Test linki güvenlik nedeniyle 24 saat içinde geçerliliğini yitirecektir.
              </p>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Success Dialog */}
      {isSuccessDialogOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Başarılı!
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
              {successMessage}
            </p>
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setIsSuccessDialogOpen(false)}
                className="px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not silme onay modalı */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          <div className="relative bg-white/90 dark:bg-gray-800/90 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
              Notu Sil
            </Dialog.Title>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bu notu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteNote}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 