import React, { useState } from 'react';
import { Video, Calendar, Clock, Users, MapPin, Share2, FileText } from 'react-feather';
import AppointmentShareModal from './AppointmentShareModal';

interface AppointmentActionsProps {
  appointment: {
    id: string;
    client: {
      id: string;
      full_name: string;
      email?: string;
    };
    professional: {
      id: string;
      full_name: string;
      email?: string;
      title?: string;
    };
    start_time: string;
    end_time: string;
    room?: {
      id: string;
      name: string;
    };
    is_online: boolean;
    meeting_url?: string;
    status: string;
  };
  onAddNote?: () => void;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({ appointment, onAddNote }) => {
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Görüşmeye katıl - doğrudan yeni sekmede açar
  const joinMeeting = () => {
    if (appointment.meeting_url) {
      window.open(appointment.meeting_url, '_blank');
    }
  };

  // Check if appointment is online and has meeting url
  const canJoinOnline = appointment.is_online && appointment.meeting_url;

  return (
    <>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-5 shadow-lg">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <span className="mr-2">Randevu Bilgileri</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
              appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {appointment.status === 'scheduled' ? 'Planlandı' :
               appointment.status === 'completed' ? 'Tamamlandı' :
               'İptal Edildi'}
            </span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tarih</div>
                <div className="text-gray-800 dark:text-gray-200">{formatDate(appointment.start_time)}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Saat</div>
                <div className="text-gray-800 dark:text-gray-200">
                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Users className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Danışan</div>
                <div className="text-gray-800 dark:text-gray-200">{appointment.client.full_name}</div>
              </div>
            </div>
            
            {!appointment.is_online && appointment.room && (
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Oda</div>
                  <div className="text-gray-800 dark:text-gray-200">{appointment.room.name}</div>
                </div>
              </div>
            )}

            {canJoinOnline && (
              <div className="flex items-start">
                <Video className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Görüşme Türü</div>
                  <div className="text-gray-800 dark:text-gray-200">Çevrimiçi (Jitsi Meet)</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {canJoinOnline && (
            <button
              onClick={joinMeeting}
              className="flex-1 py-2.5 px-4 flex items-center justify-center space-x-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
            >
              <Video className="h-4 w-4" />
              <span>Görüşmeye Katıl</span>
            </button>
          )}
          
          {canJoinOnline && (
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 py-2.5 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Paylaş</span>
            </button>
          )}
          
          <button
            onClick={onAddNote}
            className="flex-1 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Seans Notu Ekle</span>
          </button>
        </div>
      </div>

      {canJoinOnline && (
        <AppointmentShareModal
          show={showShareModal}
          onHide={() => setShowShareModal(false)}
          appointmentInfo={{
            id: appointment.id,
            client: {
              full_name: appointment.client.full_name,
              email: appointment.client.email
            },
            professional: {
              full_name: appointment.professional.full_name,
              title: appointment.professional.title
            },
            start_time: appointment.start_time,
            meeting_url: appointment.meeting_url || ''
          }}
        />
      )}
    </>
  );
};

export default AppointmentActions; 