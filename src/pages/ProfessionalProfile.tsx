import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, Calendar, MapPin, Mail, Phone, Award, Book, User, ArrowLeft, FileText, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

interface Professional {
  id: string;
  full_name: string;
  title?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  profile_image_url?: string;
  bio?: string;
  education?: string[];
  experience?: string[];
  certifications?: string[];
  assistant_id?: string;
  is_available?: boolean;
  working_hours?: any;
}

export function ProfessionalProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  useEffect(() => {
    async function loadProfessionalData() {
      if (!slug) {
        setError('Uzman bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Yükleniyor... Slug değeri:', slug);

        // Tüm profesyonelleri çekelim ve bir seferde eşleşmeleri deneyelim
        const { data: allProfs, error: allProfsError } = await supabase
          .from('professionals')
          .select('*');
          
        if (allProfsError) {
          throw allProfsError;
        }
        
        if (!allProfs || allProfs.length === 0) {
          console.log('Hiç profesyonel bulunamadı');
          throw new Error('Hiç profesyonel bulunamadı');
        }
        
        console.log(`${allProfs.length} profesyonel bulundu, eşleşme aranıyor...`);
        
        // Arama terimi için normalizasyon yapalım
        const normalizedSlug = slug.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[üÜ]/g, 'u')
          .replace(/[çÇ]/g, 'c')
          .replace(/[şŞ]/g, 's')
          .replace(/[ıİ]/g, 'i')
          .replace(/[ğĞ]/g, 'g')
          .replace(/[öÖ]/g, 'o')
          .replace(/[^a-z0-9-]/g, '');
        
        console.log('Normalize edilmiş slug:', normalizedSlug);
        
        // Tüm eşleşme yöntemlerini deneyelim
        // Her profesyonel için slug oluşturalım ve uzaklık hesaplayalım
        const professionals = allProfs.map(prof => {
          // Eğer var olan slug varsa onu kullan
          const profSlug = prof.slug || (prof.full_name ? prof.full_name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[üÜ]/g, 'u')
            .replace(/[çÇ]/g, 'c')
            .replace(/[şŞ]/g, 's')
            .replace(/[ıİ]/g, 'i')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[öÖ]/g, 'o')
            .replace(/[^a-z0-9-]/g, '') : '');
            
          const exactMatch = profSlug === normalizedSlug;
          const partialMatch = profSlug.includes(normalizedSlug) || normalizedSlug.includes(profSlug);
          const nameMatch = prof.full_name && normalizedSlug.includes(prof.full_name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[üÜ]/g, 'u')
            .replace(/[çÇ]/g, 'c')
            .replace(/[şŞ]/g, 's')
            .replace(/[ıİ]/g, 'i')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[öÖ]/g, 'o')
            .replace(/[^a-z0-9-]/g, ''));
          
          // Eşleşme puanları (tam eşleşmeden başlayıp azalan bir öncelik sırası)
          const matchScore = exactMatch ? 100 : (partialMatch ? 50 : (nameMatch ? 25 : 0));
          
          return {
            ...prof,
            profSlug,
            matchScore
          };
        });
        
        // Eşleşme puanına göre sırala (en yüksek puan ilk sırada)
        const sortedProfessionals = [...professionals].sort((a, b) => b.matchScore - a.matchScore);
        
        // En iyi eşleşmeyi al (eğer varsa)
        const bestMatch = sortedProfessionals.length > 0 && sortedProfessionals[0].matchScore > 0 
          ? sortedProfessionals[0] 
          : null;
          
        // Log sonuçları
        if (bestMatch) {
          console.log(`En iyi eşleşme: ${bestMatch.full_name} (Puan: ${bestMatch.matchScore})`);
        } else {
          console.log('Hiçbir eşleşme bulunamadı');
        }
        
        if (bestMatch) {
          // Eşleşen profesyonel bulundu
          setProfessional(bestMatch);
          
          // İlgili blog yazılarını getir
          const { data: blogData, error: blogError } = await supabase
            .from('blog_posts')
            .select('*')
            .or(`author.ilike.%${bestMatch.full_name}%,content.ilike.%${bestMatch.full_name}%`)
            .limit(3);
            
          if (!blogError && blogData) {
            setRelatedBlogs(blogData);
          }
        } else {
          // Hiçbir eşleşme bulunamadı
          throw new Error('Uzman bulunamadı. Lütfen URL\'i kontrol ediniz.');
        }
      } catch (err) {
        console.error('Uzman bilgileri yüklenirken hata oluştu:', err);
        setError('Uzman bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    loadProfessionalData();
    // Sayfa yüklendiğinde sayfanın en üstüne git
    window.scrollTo(0, 0);
  }, [slug]);

  // Randevu alma fonksiyonu
  const handleBookAppointment = () => {
    // Eğer oturum açıksa doğrudan randevu sayfasına yönlendir
    // Değilse randevu modalını göster
    setShowAppointmentModal(true);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Uzman Bulunamadı</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Aradığınız uzman bulunamadı veya profil bilgileri yüklenirken bir sorun oluştu.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Blog Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-12">
      <Helmet>
        <title>{professional.full_name} - {professional.title || 'Uzman Profili'} | PsikoRan</title>
        <meta name="description" content={`${professional.full_name} - ${professional.specialization || 'Uzman Psikolog'}. ${professional.bio?.substring(0, 150)}...`} />
        <meta name="keywords" content={`${professional.full_name}, ${professional.title}, ${professional.specialization}, psikolog, danışman, terapi, randevu`} />
        <link rel="canonical" href={`https://psikoran.com/uzman/${slug}`} />
        <meta property="og:title" content={`${professional.full_name} - ${professional.title || 'Uzman Profili'} | PsikoRan`} />
        <meta property="og:description" content={`${professional.full_name} - ${professional.specialization || 'Uzman Psikolog'}. Randevu almak ve daha fazla bilgi için tıklayın.`} />
        <meta property="og:url" content={`https://psikoran.com/uzman/${slug}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:image" content={professional.profile_image_url} />
      </Helmet>

      {/* Üst Başlık */}
      <div className="sticky top-0 z-40 w-full bg-primary-600/95 dark:bg-primary-800/95 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200 text-white"
                aria-label="Geri Dön"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="ml-3 text-lg sm:text-xl font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-lg">
                {professional.full_name} {professional.title && `- ${professional.title}`}
              </h1>
            </div>
            
            <button
              onClick={handleBookAppointment}
              className="inline-flex items-center px-3 py-1.5 bg-white text-primary-700 rounded-md text-sm font-medium shadow-sm hover:bg-primary-50 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Randevu Al
            </button>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Uzman Bilgileri */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
                      <img
                        src={professional.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.full_name)}&background=4F46E5&color=fff&size=256`}
                        alt={professional.full_name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.full_name)}&background=4F46E5&color=fff&size=256`;
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {professional.full_name}
                    </h2>
                    
                    {professional.title && (
                      <div className="mt-1 text-lg text-primary-600 dark:text-primary-400 font-medium">
                        {professional.title}
                      </div>
                    )}
                    
                    {professional.specialization && (
                      <div className="mt-2 flex items-center text-slate-600 dark:text-slate-400">
                        <Award className="h-4 w-4 mr-1.5 text-primary-500" />
                        <span className="text-sm">{professional.specialization}</span>
                      </div>
                    )}
                    
                    <div className="mt-4 space-y-1.5">
                      {professional.email && (
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Mail className="h-4 w-4 mr-1.5" />
                          <a href={`mailto:${professional.email}`} className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {professional.email}
                          </a>
                        </div>
                      )}
                      
                      {professional.phone && (
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Phone className="h-4 w-4 mr-1.5" />
                          <a href={`tel:${professional.phone}`} className="text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {professional.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {professional.bio && (
                  <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Hakkında</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {professional.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Eğitim ve Deneyim */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 sm:p-8">
                {professional.education && professional.education.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                      <Book className="h-5 w-5 mr-2 text-primary-500" />
                      Eğitim
                    </h3>
                    <ul className="space-y-2">
                      {professional.education.map((edu, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {professional.experience && professional.experience.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary-500" />
                      Deneyim
                    </h3>
                    <ul className="space-y-2">
                      {professional.experience.map((exp, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {professional.certifications && professional.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-primary-500" />
                      Sertifikalar ve Eğitimler
                    </h3>
                    <ul className="space-y-2">
                      {professional.certifications.map((cert, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!professional.education || professional.education.length === 0) && 
                  (!professional.experience || professional.experience.length === 0) &&
                  (!professional.certifications || professional.certifications.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">
                      Uzman henüz detaylı bilgilerini eklememiş.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sağ Kolon - Uzmanın Yazıları ve Randevu Seçenekleri */}
          <div className="lg:col-span-1">
            {/* Randevu Bilgileri */}
            <div className="bg-gradient-to-br from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 rounded-xl shadow-lg overflow-hidden mb-8 text-white">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Randevu Alın</h3>
                <p className="mb-5 text-primary-100">
                  {professional.full_name} ile şimdi çevrimiçi veya yüz yüze görüşme için randevu alabilirsiniz.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary-300" />
                    </div>
                    <div>
                      <div className="font-medium">Görüşme Süresi</div>
                      <div className="text-sm text-primary-200">45-50 dakika</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary-300" />
                    </div>
                    <div>
                      <div className="font-medium">Görüşme Seçenekleri</div>
                      <div className="text-sm text-primary-200">Online görüşme veya yüz yüze görüşme</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleBookAppointment}
                  className="w-full py-3 px-4 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center justify-center"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Randevu Al
                </button>
              </div>
            </div>
            
            {/* Yazılar */}
            {relatedBlogs.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary-500" />
                    {professional.full_name}'ın Yazıları
                  </h3>
                  
                  <div className="space-y-4">
                    {relatedBlogs.map(blog => (
                      <Link 
                        key={blog.id} 
                        to={`/blog/${blog.slug}`}
                        className="group block p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-4">
                            <div className="h-14 w-14 rounded-md overflow-hidden">
                              <img
                                src={blog.cover_image || `/assets/images/blog-placeholder.jpg`}
                                alt={blog.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-slate-900 dark:text-white font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {blog.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {new Date(blog.published_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link
                    to="/blog"
                    className="mt-4 inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors text-sm"
                  >
                    Tüm Blog Yazılarını Görüntüle
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Randevu Modal - Daha sonra implement edilecek */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Randevu Al
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {professional.full_name} ile randevu almak için lütfen giriş yapın veya kaydolun.
              </p>
              
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <User className="h-5 w-5 mr-2" />
                  Giriş Yap
                </Link>
                
                <Link
                  to="/register"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Kayıt Ol
                </Link>
                
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="w-full py-2.5 px-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 