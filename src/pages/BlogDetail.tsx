import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Clock, Tag, Share2, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';
import { useTheme } from '../lib/theme';

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

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const { isDarkMode, setTheme } = useTheme();

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  async function fetchBlogPost() {
    setLoading(true);
    try {
      // Supabase'den blog yazısını getir
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Yazı bulunamadı');
      
      setPost(data as BlogPost);
      
      // İlgili blog yazılarını getir
      fetchRelatedPosts(data.category, data.id);
    } catch (err) {
      console.error('Blog yazısı yüklenirken hata oluştu:', err);
      setError('Blog yazısı yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRelatedPosts(category: string, currentPostId: string) {
    try {
      // Supabase'den ilgili blog yazılarını getir
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('category', category)
        .eq('is_published', true)
        .neq('id', currentPostId)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (err) {
      console.error('İlgili yazılar yüklenirken hata oluştu:', err);
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  const sharePost = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      })
      .catch(err => console.error('Paylaşım hatası:', err));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Bağlantı panoya kopyalandı!'))
        .catch(err => console.error('Kopyalama hatası:', err));
    }
  };

  // toggleDarkMode fonksiyonu oluştur
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Yazı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Yazı Bulunamadı</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Blog sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-slate-500 text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Yazı Bulunamadı</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Aradığınız blog yazısı bulunamadı veya kaldırılmış olabilir.</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Blog sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <Logo size="small" variant={isDarkMode ? 'white' : 'default'} />
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/blog" 
                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Blog'a dön
              </Link>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                aria-label={isDarkMode ? 'Açık temaya geç' : 'Koyu temaya geç'}
              >
                {isDarkMode ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Blog Header */}
          <div className="mb-8">
            <Link 
              to={`/blog/category/${post.category.toLowerCase()}`}
              className="inline-block mb-4 px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-full dark:text-primary-300 dark:bg-primary-900/30"
            >
              {post.category}
            </Link>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight"
            >
              {post.title}
            </motion.h1>
            
            <div className="flex flex-wrap items-center text-sm text-slate-600 dark:text-slate-400 mb-6 gap-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{post.author}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{post.reading_time} dk okuma</span>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
            <img 
              src={post.cover_image} 
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Blog Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-slate prose-lg max-w-none dark:prose-invert mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Tags & Sharing */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 pb-10 mt-10">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-0">
                <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                {post.tags.map((tag, index) => (
                  <Link 
                    key={index}
                    to={`/blog/tag/${tag.toLowerCase()}`}
                    className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              
              <button
                onClick={sharePost}
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </button>
            </div>
          </div>
        </article>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 bg-slate-100 dark:bg-slate-800/50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">İlgili Yazılar</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <Link to={`/blog/${relatedPost.slug}`}>
                      <img 
                        src={relatedPost.cover_image} 
                        alt={relatedPost.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    
                    <div className="p-6">
                      <Link 
                        to={`/blog/category/${relatedPost.category.toLowerCase()}`}
                        className="inline-block mb-2 text-xs font-medium text-primary-700 dark:text-primary-400"
                      >
                        {relatedPost.category}
                      </Link>
                      
                      <Link to={`/blog/${relatedPost.slug}`}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                          {relatedPost.title}
                        </h3>
                      </Link>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                        {relatedPost.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          {formatDate(relatedPost.published_at)}
                        </div>
                        
                        <Link 
                          to={`/blog/${relatedPost.slug}`} 
                          className="inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Devamını Oku
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo size="small" variant={isDarkMode ? 'white' : 'default'} />
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Ana Sayfa
              </Link>
              <Link to="/blog" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Blog
              </Link>
              <Link to="/contact" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                İletişim
              </Link>
              <Link to="/privacy" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Gizlilik
              </Link>
              <Link to="/terms" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Kullanım Şartları
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} PsikoRan. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BlogDetail; 