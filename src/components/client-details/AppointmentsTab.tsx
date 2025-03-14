import React from 'react';

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
  pastAppointments: Appointment[];
  upcomingAppointments: Appointment[];
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  pastAppointments,
  upcomingAppointments,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h3 className="text-base sm:text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
          Gelecek Randevular
        </h3>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="mb-2 sm:mb-0">
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
                <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-center mt-2 sm:mt-0 ${
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
        <h3 className="text-base sm:text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
          Geçmiş Randevular
        </h3>
        {pastAppointments.length > 0 ? (
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="mb-2 sm:mb-0">
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
                <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-center mt-2 sm:mt-0 ${
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
  );
};

export default AppointmentsTab; 