import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ChevronRight, Search, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import logo2 from '../assets/logo/logo_2.png';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  published_at: string;
  category: string;
  tags: string[];
  slug: string;
  reading_time: number;
}

// Örnek blog yazıları
const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Psikolojik Danışmanlık Sürecinde Dikkat Edilmesi Gerekenler',
    excerpt: 'Psikolojik danışmanlık sürecine başlarken hem danışanların hem de uzmanların dikkat etmesi gereken önemli noktalar vardır.',
    content: '',
    cover_image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    author: 'Dr. Ayşe Yılmaz',
    published_at: '2023-05-15',
    category: 'Danışmanlık',
    tags: ['Psikoloji', 'Danışmanlık', 'Terapi'],
    slug: 'psikolojik-danismanlik-surecinde-dikkat-edilmesi-gerekenler',
    reading_time: 5
  },
  {
    id: '2',
    title: 'Online Terapi Seanslarının Avantajları',
    excerpt: 'Dijital çağda online terapi seansları giderek yaygınlaşıyor. Peki online terapinin sağladığı avantajlar nelerdir?',
    content: '',
    cover_image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    author: 'Uzm. Psikolog Mehmet Kaya',
    published_at: '2023-06-10',
    category: 'Online Terapi',
    tags: ['Online Terapi', 'Dijital Danışmanlık', 'Uzaktan Erişim'],
    slug: 'online-terapi-seanslarinin-avantajlari',
    reading_time: 7
  },
  {
    id: '3',
    title: 'Randevu Yönetiminde Verimlilik Nasıl Sağlanır?',
    excerpt: 'Psikolojik danışmanlık ve terapi hizmetlerinde etkili randevu yönetiminin ipuçları',
    content: '',
    cover_image: 'https://images.unsplash.com/photo-1606202762503-9691ea9a54a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1746&q=80',
    author: 'Klinik Psikolog Zeynep Aksoy',
    published_at: '2023-07-25',
    category: 'İş Yönetimi',
    tags: ['Randevu Yönetimi', 'Verimlilik', 'Zaman Yönetimi'],
    slug: 'randevu-yonetiminde-verimlilik-nasil-saglanir',
    reading_time: 4
  },
  {
    id: '4',
    title: 'Psikologlar İçin Dijital Pazarlama Stratejileri',
    excerpt: 'Dijital dünyada psikolojik danışmanlık hizmetlerinizi nasıl daha fazla kişiye ulaştırabilirsiniz?',
    content: '',
    cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1715&q=80',
    author: 'Pazarlama Uzmanı Eren Demir',
    published_at: '2023-08-05',
    category: 'Pazarlama',
    tags: ['Dijital Pazarlama', 'Sosyal Medya', 'İçerik Stratejisi'],
    slug: 'psikologlar-icin-dijital-pazarlama-stratejileri',
    reading_time: 6
  },
  {
    id: '5',
    title: 'Danışanlarla Etkili İletişim Kurma Teknikleri',
    excerpt: 'Psikolojik danışmanlık sürecinde danışanlarla etkili iletişim kurmanın yolları ve önemi',
    content: '',
    cover_image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    author: 'Dr. Ayşe Yılmaz',
    published_at: '2023-09-18',
    category: 'İletişim',
    tags: ['İletişim', 'Danışmanlık Teknikleri', 'Terapi'],
    slug: 'danisanlarla-etkili-iletisim-kurma-teknikleri',
    reading_time: 5
  },
  {
    id: '6',
    title: 'PsikoRan ile Klinik Yönetimini Dijitalleştirin',
    excerpt: 'PsikoRan platformunun sunduğu özellikler ile klinik yönetimini nasıl daha verimli hale getirebilirsiniz?',
    content: '',
    cover_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    author: 'PsikoRan Ekibi',
    published_at: '2023-10-30',
    category: 'Dijital Dönüşüm',
    tags: ['PsikoRan', 'Dijitalleşme', 'Klinik Yönetimi'],
    slug: 'psikoran-ile-klinik-yonetimini-dijitallestirin',
    reading_time: 5
  },
];

// Blog sayfası bileşeni
export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde blog yazılarını getir
  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        // Veri tabanından blog yazılarını çek
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setPosts(data as BlogPost[]);
          setFilteredPosts(data as BlogPost[]);
          
          // Kategorileri al
          const uniqueCategories = Array.from(
            new Set(data.map(post => post.category))
          );
          setCategories(uniqueCategories);
        } else {
          // Eğer veri yoksa, örnek verilerle çalış
          setPosts(sampleBlogPosts);
          setFilteredPosts(sampleBlogPosts);
          
          // Kategorileri al
          const uniqueCategories = Array.from(
            new Set(sampleBlogPosts.map(post => post.category))
          );
          setCategories(uniqueCategories);
        }
        
        // Sayfa başlığını güncelle
        document.title = "Blog - PsikoRan";
      } catch (error) {
        console.error('Blog yazıları getirilirken hata oluştu:', error);
        
        // Hata durumunda örnek verilerle devam et
        setPosts(sampleBlogPosts);
        setFilteredPosts(sampleBlogPosts);
        
        // Kategorileri al
        const uniqueCategories = Array.from(
          new Set(sampleBlogPosts.map(post => post.category))
        );
        setCategories(uniqueCategories);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogPosts();
  }, []);

  // Arama ve kategori filtreleme
  useEffect(() => {
    let result = posts;
    
    // Arama terimini uygula
    if (searchTerm) {
      result = result.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Kategori filtresini uygula
    if (selectedCategory) {
      result = result.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(result);
  }, [searchTerm, selectedCategory, posts]);

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Kategoriye göre filtreleme
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Üst başlık */}
      <div className="bg-primary-600 dark:bg-primary-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            PsikoRan Blog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-lg text-primary-100"
          >
            Psikolojik danışmanlık ve klinik yönetimi hakkında faydalı bilgiler
          </motion.p>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Arama ve filtreler */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          {/* Arama kutusu */}
          <div className="relative w-full sm:w-64 md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Yazı, yazar veya etiket ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            />
          </div>

          {/* Kategori filtreleri */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 dark:bg-primary-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Tümünü Göster
              </button>
            )}
          </div>
        </div>

        {loading ? (
          // Yükleniyor durumu
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          // Sonuç bulunamadı
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">Sonuç Bulunamadı</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Arama kriterlerinize uygun blog yazısı bulunamadı. Lütfen farklı bir arama terimi deneyin.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
              className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg"
            >
              Tüm Yazıları Göster
            </button>
          </div>
        ) : (
          // Blog yazıları listesi
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-lg"
              >
                {/* Blog yazısı görseli */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                
                {/* Blog yazısı içeriği */}
                <div className="p-6">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{post.category}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-1 text-slate-500 dark:text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">{post.author}</span>
                    </div>
                    
                    <Link
                      to={`/blog/${post.slug}`}
                      className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                    >
                      <span>Devamını Oku</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Alt bilgi */}
      <div className="bg-slate-50 dark:bg-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              PsikoRan'ı Keşfedin
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Profesyonel danışmanlık süreçlerinizi dijitalleştiren PsikoRan ile randevularınızı yönetin, 
              danışan takibini kolaylaştırın ve işinizi büyütün.
            </p>
            <Link
              to="/register"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-lg inline-flex items-center transition-colors"
            >
              <span>Ücretsiz Deneyin</span>
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 