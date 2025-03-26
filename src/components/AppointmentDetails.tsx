import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Video, Edit, Trash2, AlertTriangle, Share2, FileText, Printer, Bell } from 'react-feather';
import { useAuth } from '../lib/auth';
import OnlineMeetingModal from './OnlineMeetingModal';
import AppointmentShareModal from './AppointmentShareModal';
import AppointmentActions from './AppointmentActions';

interface AppointmentDetailsProps {
  id?: string;  // Eğer prop olarak id geçilirse kullanılır, yoksa URL'den alınır
}

export default function AppointmentDetails({ id: propId }: AppointmentDetailsProps) {
  const { id: urlId } = useParams<{ id: string }>();
  const appointmentId = propId || urlId;
  const navigate = useNavigate();
  const { professional } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      loadAppointmentDetails(appointmentId);
    }
  }, [appointmentId]);

  async function loadAppointmentDetails(id: string) {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          room:rooms(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Randevu bulunamadı');
      }

      setAppointment(data);
    } catch (error: any) {
      console.error('Randevu detayları yüklenirken hata oluştu:', error);
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  // Format date to human readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time to human readable format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Görüşmeye katıl - yeni sekmede açar
  const joinMeeting = () => {
    if (appointment?.meeting_url) {
      window.open(appointment.meeting_url, '_blank');
    }
  };

  // Seans notu ekleme sayfasına yönlendirme
  const handleAddNote = () => {
    navigate(`/session-notes/create/${appointment.id}`);
  };

  // Randevu düzenleme sayfasına yönlendirme
  const handleEditAppointment = () => {
    navigate(`/appointments/edit/${appointment.id}`);
  };

  // Randevuyu sil
  const handleDeleteAppointment = async () => {
    if (window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', appointment.id);
        
        if (error) throw error;
        
        navigate('/appointments');
      } catch (error) {
        console.error('Randevu silinirken hata oluştu:', error);
        alert('Randevu silinirken bir hata oluştu.');
      }
    }
  };

  // Randevu oluşturulmuşsa ve online bir görüşme ise, toplantı URL'sini kontrol et
  const canJoinOnline = appointment?.is_online && appointment?.meeting_url;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Randevu detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Hata</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            Randevulara Dön
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Randevu Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">İstediğiniz randevu bilgisi mevcut değil.</p>
          <button
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
          >
            Randevulara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/appointments')}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Randevu Detayları
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Ana randevu bilgileri */}
          <AppointmentActions 
            appointment={appointment} 
            onAddNote={handleAddNote}
          />
            
          {/* Danışan Bilgileri */}
          <div className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-300 mb-3">
              Danışan Bilgileri
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{appointment.client?.full_name}</span>
              </div>
              {appointment.client?.email && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">E-posta:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{appointment.client?.email}</span>
                </div>
              )}
              {appointment.client?.phone && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Telefon:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{appointment.client?.phone}</span>
                </div>
              )}
            </div>
          </div>
            
          {/* Notlar */}
          {appointment.notes && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/20">
              <h4 className="text-md font-medium text-amber-800 dark:text-amber-300 mb-2">
                Randevu Notları
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hızlı İşlemler
            </h3>
            
            <div className="space-y-3">
              {canJoinOnline && (
                <button
                  onClick={joinMeeting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Video className="h-4 w-4 mr-2" />
                  <span>Görüşmeye Katıl</span>
                </button>
              )}
              
              <button
                onClick={handleAddNote}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Seans Notu Ekle</span>
              </button>
              
              <button
                onClick={handleEditAppointment}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                <span>Düzenle</span>
              </button>
              
              {canJoinOnline && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Bağlantıyı Paylaş</span>
                </button>
              )}
              
              <button
                onClick={handleDeleteAppointment}
                className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Sil</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Randevu Detayları
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Randevu ID:</span>
                <span className="font-medium">#{appointment.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Oluşturulma:</span>
                <span>{new Date(appointment.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Uzman:</span>
                <span>{appointment.professional?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Durum:</span>
                <span className={`font-medium ${
                  appointment.status === 'scheduled' ? 'text-blue-600 dark:text-blue-400' :
                  appointment.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {appointment.status === 'scheduled' ? 'Planlandı' :
                  appointment.status === 'completed' ? 'Tamamlandı' :
                  'İptal Edildi'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Görüşme Tipi:</span>
                <span>{appointment.is_online ? 'Çevrimiçi' : 'Yüz Yüze'}</span>
              </div>
              {appointment.is_online && (
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span>Görüşme Linki:</span>
                  {appointment.meeting_url ? (
                    <button
                      onClick={joinMeeting}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition-colors duration-200 text-xs flex items-center"
                    >
                      <Video className="h-3 w-3 mr-1" />
                      <span>Görüşmeye Katıl</span>
                    </button>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 text-xs">Görüşme başlamadı</span>
                  )}
                </div>
              )}
              {appointment.room && !appointment.is_online && (
                <div className="flex justify-between">
                  <span>Görüşme Odası:</span>
                  <span>{appointment.room.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {canJoinOnline && (
        <AppointmentShareModal
          show={showShareModal}
          onHide={() => setShowShareModal(false)}
          appointmentInfo={{
            id: appointment.id,
            client: {
              full_name: appointment.client?.full_name,
              email: appointment.client?.email
            },
            professional: {
              full_name: professional?.full_name || appointment.professional?.full_name,
              title: professional?.title || appointment.professional?.title
            },
            start_time: appointment.start_time,
            meeting_url: appointment.meeting_url
          }}
        />
      )}
    </div>
  );
} 