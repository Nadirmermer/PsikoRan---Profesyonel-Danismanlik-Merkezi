import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Plus, CheckCircle, XCircle, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import CreateAppointmentModal from '../../components/appointment/CreateAppointmentModal';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  professional: {
    full_name: string;
  };
  room?: {
    name: string;
  };
}

interface AppointmentsTabProps {
  clientId: string;
  appointments: {
    upcoming: Appointment[];
    past: Appointment[];
  };
  loadAppointments: () => Promise<boolean>;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  clientId,
  appointments,
  loadAppointments,
}) => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  return (
    <div className="space-y-8">
      {/* Yeni Randevu Ekle Butonu */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-md transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Randevu Oluştur</span>
        </motion.button>
      </div>

      {/* Randevu Oluşturma Modalı */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          initialClientId={clientId}
          onSuccess={loadAppointments}
        />
      )}

      {/* Gelecek Randevular */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center mb-4">
          <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Gelecek Randevular
          </h3>
          <div className="ml-2 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
            {appointments.upcoming.length}
          </div>
        </div>

        {appointments.upcoming.length > 0 ? (
          <div className="grid gap-4">
            {appointments.upcoming.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                onClick={() => navigate(`/appointment/${appointment.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center">
                  {/* Sol Taraf - Tarih */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-5 flex items-center sm:items-start gap-3 sm:min-w-[180px]">
                    <Calendar className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">
                        {format(new Date(appointment.start_time), 'EEEE', { locale: tr })}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {format(new Date(appointment.start_time), 'd', { locale: tr })}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {format(new Date(appointment.start_time), 'MMMM yyyy', { locale: tr })}
                      </div>
                    </div>
                  </div>

                  {/* Orta Kısım - Detaylar */}
                  <div className="p-4 sm:py-5 sm:px-6 flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {format(new Date(appointment.start_time), 'HH:mm', { locale: tr })} - 
                          {format(new Date(appointment.end_time), 'HH:mm', { locale: tr })}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
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
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {appointment.professional.full_name}
                        </span>
                      </div>
                      
                      {appointment.room && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {appointment.room.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center"
          >
            <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-1">Gelecek randevu bulunmuyor</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-5">Bu danışan için henüz bir randevu planlanmamış.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Randevu Ekle</span>
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Geçmiş Randevular */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            Geçmiş Randevular
          </h3>
          <div className="ml-2 px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
            {appointments.past.length}
          </div>
        </div>

        {appointments.past.length > 0 ? (
          <div className="grid gap-4">
            {appointments.past.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                onClick={() => navigate(`/appointment/${appointment.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center">
                  {/* Sol Taraf - Tarih */}
                  <div className={`p-4 sm:p-5 flex items-center sm:items-start gap-3 sm:min-w-[180px] 
                    ${appointment.status === 'completed' 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : appointment.status === 'cancelled'
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}>
                    <div>
                      {appointment.status === 'completed' && (
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                      )}
                      {appointment.status === 'cancelled' && (
                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                      )}
                      {appointment.status === 'scheduled' && (
                        <Calendar className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase">
                        {format(new Date(appointment.start_time), 'EEEE', { locale: tr })}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {format(new Date(appointment.start_time), 'd', { locale: tr })}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {format(new Date(appointment.start_time), 'MMMM yyyy', { locale: tr })}
                      </div>
                    </div>
                  </div>

                  {/* Orta Kısım - Detaylar */}
                  <div className="p-4 sm:py-5 sm:px-6 flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {format(new Date(appointment.start_time), 'HH:mm', { locale: tr })} - 
                          {format(new Date(appointment.end_time), 'HH:mm', { locale: tr })}
                        </span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
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
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {appointment.professional.full_name}
                        </span>
                      </div>
                      
                      {appointment.room && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {appointment.room.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center"
          >
            <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-1">Geçmiş randevu bulunmuyor</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Bu danışana ait geçmiş randevu kaydı yok.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AppointmentsTab; 