import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, Copy, Twitter, Facebook, Linkedin, Heart, ExternalLink, ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchBlogPostBySlug, formatBlogDate, processProfessionalNames, generateBlogJsonLd } from '../lib/blog';
import { MainLayout } from '../components/layout/MainLayout';
import { Helmet } from 'react-helmet-async';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import OptimizedImage from '../components/OptimizedImage';

// Blog yazısı tipi
interface BlogPostType {
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

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);

  useEffect(() => {
    async function loadBlogPost() {
      try {
        if (!slug) {
          setError('Blog yazısı bulunamadı');
          return;
        }

        setLoading(true);
        const blogPost = await fetchBlogPostBySlug(slug);
        
        if (blogPost) {
          setPost(blogPost);
          // Blog başlığını sayfa başlığı olarak ayarla
          document.title = `${blogPost.title} - PsikoRan Blog`;
          
          // İlgili yazıları yükle - daha sonra geliştirilecek
          // Şu an için boş bırakılıyor
          setRelatedPosts([]);
        } else {
          setError('Blog yazısı bulunamadı');
          document.title = 'Yazı Bulunamadı - PsikoRan Blog';
        }
      } catch (err) {
        console.error('Blog yazısı yüklenirken hata oluştu:', err);
        setError('Blog yazısı yüklenirken bir hata oluştu');
        document.title = 'Hata - PsikoRan Blog';
      } finally {
        setLoading(false);
      }
    }

    loadBlogPost();
    // Sayfa değiştiğinde başa dön
    window.scrollTo(0, 0);
  }, [slug]);

  // URL'yi kopyala
  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('URL kopyalanırken hata oluştu:', err);
      }
    );
  };

  // Twitter'da paylaş
  const shareOnTwitter = () => {
    if (!post) return;
    const text = `${post.title} - PsikoRan Blog`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  // Facebook'ta paylaş
  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  // LinkedIn'de paylaş
  const shareOnLinkedIn = () => {
    if (!post) return;
    const url = window.location.href;
    const title = post.title;
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
  };

  // Blog içeriğini HTML olarak render et
  const renderContent = (content: string) => {
    // Uzmanlara otomatik link ekle
    const processedContent = processProfessionalNames(content);
    return { __html: processedContent };
  };

  if (loading) {
    return (
      <LoadingSpinner fullPage loadingText="Makale yükleniyor..." />
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto text-center py-12 px-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Blog Yazısı Bulunamadı</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Aradığınız blog yazısı bulunamadı veya kaldırılmış olabilir.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Tüm Blog Yazılarına Dön
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Blog için yapılandırılmış veri
  const jsonLdScript = generateBlogJsonLd(post);

  return (
    <MainLayout>
      <Helmet>
        <title>{post.title} - PsikoRan Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.tags ? post.tags.join(', ') : ''} />
        <link rel="canonical" href={`https://psikoran.com/blog/${post.slug}`} />
        <meta property="og:title" content={`${post.title} - PsikoRan Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://psikoran.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="PsikoRan" />
        <meta property="og:image" content={post.cover_image || '/assets/images/blog-placeholder.jpg'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} - PsikoRan Blog`} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.cover_image || '/assets/images/blog-placeholder.jpg'} />
        <script type="application/ld+json">{jsonLdScript}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        {/* Geri butonu */}
        <Link to="/blog" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Bloga dön</span>
                </Link>
                  
        <article>
          {/* Blog yazısı başlığı ve meta bilgiler */}
            <motion.header 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                <Link 
                  to={`/blog?category=${post.category}`}
                  className="inline-flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 rounded-full font-medium transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/50"
                >
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {post.category}
                </Link>
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                  {formatBlogDate(post.published_at)}
                </span>
                <span className="inline-flex items-center">
                  <User className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                  {post.author}
                </span>
                <ReadTime 
                  minutes={post.reading_time} 
                  className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs"
                  iconClassName="h-3.5 w-3.5 mr-1.5 text-slate-400 dark:text-slate-500"
                />
              </div>
              
              <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                {post.excerpt}
              </p>
            </motion.header>

            {/* Cover Image */}
            <div className="relative w-full h-64 sm:h-72 md:h-96 rounded-xl overflow-hidden mb-8 shadow-lg">
              <OptimizedImage
                src={post.cover_image || '/assets/images/blog-placeholder.jpg'}
                alt={post.title}
                width={1200}
                height={675}
                quality={90}
                className="w-full h-full object-cover"
                fallbackSrc="/assets/images/blog-placeholder.jpg"
              />
            </div>

            {/* Blog içeriği */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="prose prose-lg dark:prose-invert prose-slate max-w-none mb-12
                prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-ul:text-slate-700 dark:prose-ul:text-slate-300
                prose-ol:text-slate-700 dark:prose-ol:text-slate-300
                prose-li:mb-1
                prose-blockquote:border-l-primary-500 dark:prose-blockquote:border-l-primary-500
                prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300
                prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-code:text-slate-900 dark:prose-code:text-slate-200
                prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-slate-800 dark:prose-pre:bg-slate-900 prose-pre:text-slate-200 dark:prose-pre:text-slate-200 prose-pre:shadow-lg"
            >
              <div dangerouslySetInnerHTML={renderContent(post.content)} />
            </motion.div>

            {/* Mobil paylaşım */}
            <div className="md:hidden flex justify-center mb-10 space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 text-sm"
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                {copied ? 'Kopyalandı!' : 'Paylaş'}
              </button>
              <button
                onClick={shareOnTwitter}
                className="p-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a94df] transition-colors duration-200"
              >
                <Twitter className="h-4 w-4" />
              </button>
              <button
                onClick={shareOnFacebook}
                className="p-2 bg-[#4267B2] text-white rounded-lg hover:bg-[#3b5c9f] transition-colors duration-200"
              >
                <Facebook className="h-4 w-4" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006ba3] transition-colors duration-200"
              >
                <Linkedin className="h-4 w-4" />
              </button>
            </div>

            {/* Etiketler */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Yazarla ilgili bilgi */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 rounded-xl p-6 mb-10 shadow-md border border-slate-200/70 dark:border-slate-700/30">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
                    {post.author.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{post.author}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                    PsikoRan platformunda profesyonel danışmanlık ve klinik yönetimi konularında uzman yazar.
                  </p>
                </div>
              </div>
            </div>
            
            {/* İlgili bağlantılar ve CTA */}
            <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-600 dark:to-primary-500 p-6 sm:p-8 text-white shadow-lg mb-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-3">PsikoRan ile Tanışın</h3>
              <p className="mb-6 text-sm sm:text-base text-white/90">
                Profesyonel danışmanlık süreçlerinizi dijitalleştiren PsikoRan ile randevularınızı yönetin, 
                danışan takibini kolaylaştırın ve işinizi büyütün.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/kayit"
                  className="inline-flex items-center px-4 py-2 bg-white text-primary-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Şimdi Kaydolun
                </Link>
                <Link
                  to="/blog"
                  className="inline-flex items-center px-4 py-2 bg-primary-700/40 text-white font-medium rounded-lg hover:bg-primary-700/60 transition-colors duration-200 text-sm"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Diğer Yazılar
                </Link>
              </div>
            </div>
          </article>
        </div>
    </MainLayout>
  );
} 