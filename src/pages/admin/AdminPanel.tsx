import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth'; // Gerekirse admin bilgilerini almak için
import { LogOut, Users, User, Building, Mail, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'; // LoadingSpinner importu

// Veri tipleri (Gerekirse genişletilebilir)
interface Assistant {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  clinic_name?: string;
  // Diğer asistan alanları...
}

interface Professional {
  id: string;
  full_name: string;
  title?: string;
  email?: string;
  assistant_id: string; // Hangi asistana bağlı olduğunu belirtir
  // Diğer profesyonel alanları...
}

export function AdminPanel() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Asistanları çek
        const { data: assistantsData, error: assistantsError } = await supabase
          .from('assistants')
          .select('id, full_name, email, phone, clinic_name'); 

        if (assistantsError) throw assistantsError;
        setAssistants(assistantsData || []);

        // Profesyonelleri çek
        const { data: professionalsData, error: professionalsError } = await supabase
          .from('professionals')
          .select('id, full_name, title, email, assistant_id');

        if (professionalsError) throw professionalsError;
        setProfessionals(professionalsData || []);

      } catch (err: any) {
        console.error("Veri çekme hatası:", err);
        setError("Veriler yüklenirken bir hata oluştu: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login'); // Çıkış sonrası admin girişine yönlendir
  };

  // Profesyonelleri asistan ID'sine göre grupla
  const professionalsByAssistant = professionals.reduce((acc, prof) => {
    const assistantId = prof.assistant_id;
    if (!acc[assistantId]) {
      acc[assistantId] = [];
    }
    acc[assistantId].push(prof);
    return acc;
  }, {} as Record<string, Professional[]>); // Tip belirtimi

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Basit bir header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Admin Paneli
          </h1>
          <div className="flex items-center space-x-4">
             {admin && <span className="text-sm font-medium hidden sm:block">Hoşgeldin, {admin.full_name || admin.email || 'Admin'}</span>}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Ana İçerik Alanı */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold mb-6">Klinikler / Asistanlar ve Bağlı Uzmanlar</h2>
        
        {loading && (
          <div className="flex justify-center items-center p-10">
            <LoadingSpinner size="large" />
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600/30" role="alert">
            <span className="font-medium">Hata:</span> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {assistants.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400">Henüz kayıtlı asistan/klinik bulunmuyor.</p>
            ) : (
              assistants.map(assistant => (
                <div key={assistant.id} className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-400 flex items-center">
                      <Building className="h-5 w-5 mr-2" /> 
                      {assistant.clinic_name || 'İsimsiz Klinik'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center">
                      <User className="h-4 w-4 mr-1.5 text-slate-400"/>
                      Asistan: {assistant.full_name}
                    </p>
                    <div className="flex space-x-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                       {assistant.email && (
                         <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-slate-400"/> {assistant.email}
                         </span>
                       )}
                       {assistant.phone && (
                          <span className="flex items-center">
                           <Phone className="h-4 w-4 mr-1 text-slate-400"/> {assistant.phone}
                          </span>
                       )}
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <h4 className="text-md font-medium mb-3 text-slate-800 dark:text-slate-200 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400" />
                      Bağlı Ruh Sağlığı Uzmanları
                    </h4>
                    {(professionalsByAssistant[assistant.id] && professionalsByAssistant[assistant.id].length > 0) ? (
                      <ul className="space-y-3">
                        {professionalsByAssistant[assistant.id].map(professional => (
                          <li key={professional.id} className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-md border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{professional.full_name}</p>
                              {professional.title && <p className="text-xs text-slate-500 dark:text-slate-400">{professional.title}</p>}
                            </div>
                            {professional.email && <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">{professional.email}</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic">Bu asistana bağlı uzman bulunmuyor.</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Örnek: Admin bilgilerini gösterme */}
        {admin && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Admin Bilgileri (Test Amaçlı)</h3>
            <pre className="text-xs text-blue-700 dark:text-blue-400 overflow-x-auto">
              {JSON.stringify(admin, null, 2)}
            </pre>
          </div>
        )}

      </main>
    </div>
  );
}

// AdminPanel bileşenini export etmeyi unutmayalım
export default AdminPanel; 