import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Professional } from '../types';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

// Bileşenimizi Tailwind CSS kullanacak şekilde değiştirelim
export const ExpertsList: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        
        // Tüm profesyonelleri çek, sadece aktif olanları getir
        const { data, error } = await supabase
          .from('professionals')
          .select('*')
          .order('full_name', { ascending: true });

        if (error) throw error;

        console.log('Çekilen profesyoneller:', data);
        
        if (!data || data.length === 0) {
          console.warn('Veritabanından profesyonel verisi gelmiyor!');
          // Buraya test için geçici profesyonel verisi ekleyebiliriz
          // Bu veriyi gerçek veritabanı verisiyle değiştireceksiniz
          const dummyProfessionals: Professional[] = [
            {
              id: '1',
              user_id: '1',
              full_name: 'Dr. Ayşe Yılmaz',
              title: 'Klinik Psikolog',
              specialization: 'Depresyon, Anksiyete',
              bio: 'Klinik psikoloji alanında 10 yıllık deneyime sahibim.',
              slug: 'dr-ayse-yilmaz'
            },
            {
              id: '2',
              user_id: '2',
              full_name: 'Mehmet Kaya',
              title: 'Aile Terapisti',
              specialization: 'Aile Terapisi, Evlilik Danışmanlığı',
              bio: 'Aile ve çift terapisi konusunda uzmanlaşmış profesyonel danışman.',
              slug: 'mehmet-kaya'
            },
            {
              id: '3',
              user_id: '3',
              full_name: 'Zeynep Demir',
              title: 'Uzman Psikolog',
              specialization: 'Çocuk ve Ergen Psikolojisi',
              bio: 'Çocuk ve ergen danışmanlığı konusunda 8 yıllık deneyim.',
              slug: 'zeynep-demir'
            }
          ];
          
          setProfessionals(dummyProfessionals);
          setFilteredProfessionals(dummyProfessionals);
        } else {
          setProfessionals(data);
          setFilteredProfessionals(data);
        }
      } catch (err) {
        console.error('Uzmanları getirirken hata:', err);
        setError('Uzmanlar listelenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProfessionals(professionals);
      return;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase();
    const filtered = professionals.filter(
      (professional) =>
        professional.full_name.toLowerCase().includes(normalizedSearchTerm) ||
        (professional.bio && professional.bio.toLowerCase().includes(normalizedSearchTerm)) ||
        (professional.specialization && professional.specialization.toLowerCase().includes(normalizedSearchTerm))
    );

    setFilteredProfessionals(filtered);
  }, [searchTerm, professionals]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[üÜ]/g, 'u')
      .replace(/[çÇ]/g, 'c')
      .replace(/[şŞ]/g, 's')
      .replace(/[ıİ]/g, 'i')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[öÖ]/g, 'o')
      .replace(/[^a-z0-9-]/g, '');
  };

  // Profesyonel kartını daha güzel göstermek için
  const renderProfessionalCard = (professional: Professional, index: number) => {
    return (
      <motion.div
        key={professional.id} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 * index }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      >
        <Link to={`/uzman/${professional.slug || generateSlug(professional.full_name)}`}>
          <div className="relative h-60 bg-slate-200 dark:bg-slate-700">
            <img
              src={professional.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.full_name)}&background=4F46E5&color=fff&size=256`}
              alt={professional.full_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(professional.full_name)}&background=4F46E5&color=fff&size=256`;
              }}
            />
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {professional.full_name}
            </h3>
            
            {professional.title && (
              <div className="text-primary-600 dark:text-primary-400 font-medium mb-3">
                {professional.title}
              </div>
            )}
            
            {professional.specialization && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{professional.specialization}</span>
              </div>
            )}
            
            {professional.bio && (
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">
                {professional.bio}
              </p>
            )}
            
            <div className="flex justify-end">
              <span className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors">
                Profili Görüntüle
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Helmet>
        <title>Ruh Sağlığı Uzmanlarımız | PsikoRan</title>
        <meta name="description" content="Profesyonel ve deneyimli ruh sağlığı uzmanlarımızla tanışın. Uzmanlarımız arasından size en uygun olanı seçerek randevu alabilirsiniz." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold mb-4"
          >
            Ruh Sağlığı Uzmanlarımız
          </motion.h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-8">
            Alanında uzman ve deneyimli ruh sağlığı profesyonellerimizle tanışın ve ihtiyacınıza en uygun desteği alın.
          </p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative max-w-md mx-auto"
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Uzman adı veya uzmanlık alanı ara..."
              className="block w-full pl-10 pr-4 py-3 bg-white/10 text-white border-0 rounded-lg focus:ring-2 focus:ring-white/50 focus:outline-none placeholder:text-white/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Uzman Kartları */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-60 bg-slate-200 dark:bg-slate-700"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Bir Hata Oluştu
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
              Uzman Bulunamadı
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Arama kriterleriyle eşleşen uzman bulunamadı. Farklı anahtar kelimelerle tekrar deneyin.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((professional, index) => 
              renderProfessionalCard(professional, index)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertsList; 