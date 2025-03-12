import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { format, addWeeks, addMonths, startOfToday, isBefore, isAfter, isSameDay, addMinutes } from 'date-fns';
import { Search, Calendar, Clock, Users, Home, FileText, RefreshCw, X } from 'react-feather';
import { DatePicker } from '@mantine/dates';
import { MantineProvider, MantineTheme, createTheme } from '@mantine/core';
import { tr } from 'date-fns/locale';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

dayjs.locale('tr');

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clinicHours: {
    pazartesi: { opening: string; closing: string; isOpen: boolean };
    sali: { opening: string; closing: string; isOpen: boolean };
    carsamba: { opening: string; closing: string; isOpen: boolean };
    persembe: { opening: string; closing: string; isOpen: boolean };
    cuma: { opening: string; closing: string; isOpen: boolean };
    cumartesi: { opening: string; closing: string; isOpen: boolean };
    pazar: { opening: string; closing: string; isOpen: boolean };
  };
}

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

interface ProfessionalWorkingHours {
  pazartesi: { opening: string; closing: string; isOpen: boolean };
  sali: { opening: string; closing: string; isOpen: boolean };
  carsamba: { opening: string; closing: string; isOpen: boolean };
  persembe: { opening: string; closing: string; isOpen: boolean };
  cuma: { opening: string; closing: string; isOpen: boolean };
  cumartesi: { opening: string; closing: string; isOpen: boolean };
  pazar: { opening: string; closing: string; isOpen: boolean };
}

function AlertModal({ isOpen, onClose, title, message }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}

// Yardımcı fonksiyon: Geçerli saatten önceki saatleri devre dışı bırakmak için
function isTimeBeforeCurrent(time: string, selectedDate: Date | null) {
  if (!selectedDate) return false;
  
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const timeDate = new Date(selectedDate);
  timeDate.setHours(hours, minutes, 0, 0);

  return timeDate <= now;
}

// Yardımcı fonksiyon: Ruh sağlığı uzmanının belirli bir zaman diliminde randevusu var mı kontrol et
function hasProfessionalAppointment(
  time: string, 
  selectedDate: Date, 
  existingAppointments: any[], 
  professionalId: string | null,
  duration: string
) {
  if (!professionalId) return false;

  const appointmentStart = new Date(selectedDate);
  const [hours, minutes] = time.split(':').map(Number);
  appointmentStart.setHours(hours, minutes, 0, 0);
  
  const appointmentEnd = new Date(appointmentStart.getTime() + parseInt(duration) * 60000);

  return existingAppointments.some(appointment => {
    if (appointment.professional_id !== professionalId) return false;

    const existingStart = new Date(appointment.start_time);
    const existingEnd = new Date(appointment.end_time);

    return (
      (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
      (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
      (appointmentStart <= existingStart && appointmentEnd >= existingEnd)
    );
  });
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  clinicHours,
}: CreateAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [duration] = useState('45');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });
  const [professionalWorkingHours, setProfessionalWorkingHours] = useState<ProfessionalWorkingHours | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const { professional, assistant } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadRooms();
    }
  }, [isOpen, professional?.id]);

  async function loadClients() {
    try {
      let query = supabase
        .from('clients')
        .select('*, professional:professionals(id, full_name)')
        .order('full_name');

      if (professional) {
        query = query.eq('professional_id', professional.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async function loadRooms() {
    try {
      let query = supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (professional) {
        const { data: prof } = await supabase
          .from('professionals')
          .select('assistant_id')
          .eq('id', professional.id)
          .single();

        if (prof?.assistant_id) {
          query = query.eq('assistant_id', prof.assistant_id);
        }
      } else if (assistant) {
        query = query.eq('assistant_id', assistant.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  }

  async function loadExistingAppointments(date: string) {
    try {
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(23, 59, 59, 999);

      // Temel sorguyu oluştur
      const baseQuery = supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          room_id,
          professional_id,
          client:clients(id, full_name),
          professional:professionals(id, full_name),
          room:rooms(id, name, capacity)
        `)
        .gte('start_time', startTime.toISOString())
        .lte('start_time', endTime.toISOString())
        .eq('status', 'scheduled');

      // Ruh sağlığı uzmanı ise sadece kendi randevularını görsün
      const query = professional 
        ? baseQuery.eq('professional_id', professional.id)
        : baseQuery;

      const { data, error } = await query;
      if (error) throw error;

      setExistingAppointments(data || []);
    } catch (error) {
      console.error('Error loading existing appointments:', error);
      setAlertModal({
        isOpen: true,
        title: 'Hata',
        message: 'Randevular yüklenirken bir hata oluştu.'
      });
    }
  }

  // Klinik açık olan günleri kontrol eden fonksiyon
  const isClinicOpen = (date: Date) => {
      const dayOfWeek = date.getDay();
      const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
      const currentDay = days[dayOfWeek];
      const dayHours = clinicHours[currentDay];
    return dayHours?.isOpen ?? false;
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.professional?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  function calculateAvailableTimeSlots(date: Date) {
    const dayOfWeek = date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    
    let openingHour, closingHour;

    // Hem ruh sağlığı uzmanı hem de klinik saatlerini kontrol et
    const profHours = professionalWorkingHours?.[currentDay];
    const clinicDayHours = clinicHours[currentDay];

    if (!profHours?.isOpen || !clinicDayHours.isOpen) return [];

    // En geç başlangıç ve en erken bitiş saatlerini al
    const [profOpenHour] = profHours.opening.split(':').map(Number);
    const [profCloseHour] = profHours.closing.split(':').map(Number);
    const [clinicOpenHour] = clinicDayHours.opening.split(':').map(Number);
    const [clinicCloseHour] = clinicDayHours.closing.split(':').map(Number);

    openingHour = Math.max(profOpenHour, clinicOpenHour);
    closingHour = Math.min(profCloseHour, clinicCloseHour);

    const slots: string[] = [];
    let currentHour = openingHour;
    let currentMinute = 0;

    while (currentHour < closingHour || (currentHour === closingHour && currentMinute === 0)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Ruh sağlığı uzmanının bu saatte başka randevusu var mı kontrol et
      const hasConflict = hasProfessionalAppointment(
        timeString,
        date,
        existingAppointments,
        selectedProfessionalId,
        duration
      );

      if (!hasConflict) {
        slots.push(timeString);
      }

      currentMinute += 15;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    return slots;
  }

  function calculateAvailableRooms(date: string, timeSlot: string) {
    if (!rooms.length || !date || !timeSlot) return [];

    const startTime = new Date(date);
    const [hours, minutes] = timeSlot.split(':').map(Number);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);

    return rooms.filter(room => {
      // O saatteki randevuları bul
      const overlappingAppointments = existingAppointments.filter(appointment => {
        const appointmentStart = new Date(appointment.start_time);
        const appointmentEnd = new Date(appointment.end_time);

        // Zaman çakışması kontrolü
        const hasTimeOverlap = (
          (startTime >= appointmentStart && startTime < appointmentEnd) ||
          (endTime > appointmentStart && endTime <= appointmentEnd) ||
          (startTime <= appointmentStart && endTime >= appointmentEnd)
        );

        // Aynı oda kontrolü
        return appointment.room_id === room.id && hasTimeOverlap;
      });

      // Oda kapasitesi kontrolü
      if (room.capacity === 1) {
        return overlappingAppointments.length === 0;
      }

      // Çoklu kapasiteli odalar için
      const availableCapacity = room.capacity - overlappingAppointments.length;
      return availableCapacity > 0;
    });
  }

  const handleClientSelect = async (client: any) => {
    setSelectedClient(client);
    setSearchTerm(client.full_name);
    setSelectedDate(null);
    setSelectedTime('');
    setSelectedRoom('');
    setFilteredClients([]);
    
    // Seçilen danışanın ruh sağlığı uzmanının ID'sini kaydet
    const professionalId = client.professional_id;
    setSelectedProfessionalId(professionalId);
    
    // Ruh sağlığı uzmanının çalışma saatlerini yükle
    if (professionalId) {
      await loadProfessionalWorkingHours(professionalId);
    } else {
      setAlertModal({
        isOpen: true,
        title: 'Hata',
        message: 'Danışanın ruh sağlığı uzmanı bulunamadı.'
      });
    }
  };

  const handleDateSelect = async (date: Date | null) => {
    if (!date) return;
    
    // Önce tarihin geçerli olup olmadığını kontrol et
    const now = new Date();
    if (date < now) {
      setAlertModal({
        isOpen: true,
        title: 'Geçersiz Tarih',
        message: 'Geçmiş bir tarih seçemezsiniz.'
      });
      return;
    }

    // Klinik ve ruh sağlığı uzmanı çalışma günü kontrolü
    if (!isDateAvailable(date)) {
      setAlertModal({
        isOpen: true,
        title: 'Uygun Değil',
        message: 'Seçilen tarihte klinik veya ruh sağlığı uzmanı çalışmıyor.'
      });
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime('');
    setSelectedRoom('');
    
    try {
      // Önce mevcut randevuları yükle
      await loadExistingAppointments(date.toISOString().split('T')[0]);
      
      // Müsait saatleri hesapla
      const availableSlots = calculateAvailableTimeSlots(date);
      setAvailableTimeSlots(availableSlots);

      // Eğer müsait saat yoksa kullanıcıyı bilgilendir
      if (availableSlots.length === 0) {
        setAlertModal({
          isOpen: true,
          title: 'Müsait Saat Yok',
          message: 'Seçilen tarihte müsait saat bulunmuyor. Lütfen başka bir tarih seçin.'
        });
      }
    } catch (error) {
      console.error('Error in handleDateSelect:', error);
      setAlertModal({
        isOpen: true,
        title: 'Hata',
        message: 'Müsait saatler hesaplanırken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    }
  };

  const handleTimeSelect = (time: string) => {
    // Geçmiş saat kontrolü
    if (isTimeBeforeCurrent(time, selectedDate)) {
      setAlertModal({
        isOpen: true,
        title: 'Geçersiz Saat',
        message: 'Geçmiş bir saat seçemezsiniz.'
      });
      return;
    }

    // Ruh sağlığı uzmanının müsaitlik kontrolü
    const hasConflict = hasProfessionalAppointment(
      time,
      selectedDate!,
      existingAppointments,
      selectedProfessionalId,
      duration
    );

    if (hasConflict) {
      setAlertModal({
        isOpen: true,
        title: 'Uygun Değil',
        message: 'Seçilen saatte ruh sağlığı uzmanının başka bir randevusu var.'
      });
      return;
    }

    setSelectedTime(time);
    setSelectedRoom('');
    if (selectedDate) {
      const date = selectedDate.toISOString().split('T')[0];
      const availableRooms = calculateAvailableRooms(date, time);
      setAvailableRooms(availableRooms);

      if (availableRooms.length === 0) {
        setAlertModal({
          isOpen: true,
          title: 'Müsait Oda Yok',
          message: 'Seçilen saatte müsait oda bulunmuyor. Lütfen başka bir saat seçin.'
        });
      }
    }
  };

  async function handleCreateAppointment() {
    if (!selectedClient || !selectedDate || !selectedTime || !selectedRoom) return;

    setLoading(true);
    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);

      const appointment = {
        client_id: selectedClient.id,
        professional_id: professional?.id || selectedClient.professional_id,
        room_id: selectedRoom,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'scheduled'
      };

      const { error } = await supabase
        .from('appointments')
        .insert([appointment]);

      if (error) {
        setAlertModal({
          isOpen: true,
          title: 'Hata',
          message: 'Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
        });
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setAlertModal({
        isOpen: true,
        title: 'Hata',
        message: 'Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setLoading(false);
    }
  }

  // Ruh sağlığı uzmanının çalışma saatlerini yükleme fonksiyonu
  async function loadProfessionalWorkingHours(professionalId: string) {
    try {
      const { data, error } = await supabase
        .from('professional_working_hours')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfessionalWorkingHours({
          pazartesi: {
            opening: data.opening_time_monday,
            closing: data.closing_time_monday,
            isOpen: data.is_open_monday ?? true
          },
          sali: {
            opening: data.opening_time_tuesday,
            closing: data.closing_time_tuesday,
            isOpen: data.is_open_tuesday ?? true
          },
          carsamba: {
            opening: data.opening_time_wednesday,
            closing: data.closing_time_wednesday,
            isOpen: data.is_open_wednesday ?? true
          },
          persembe: {
            opening: data.opening_time_thursday,
            closing: data.closing_time_thursday,
            isOpen: data.is_open_thursday ?? true
          },
          cuma: {
            opening: data.opening_time_friday,
            closing: data.closing_time_friday,
            isOpen: data.is_open_friday ?? true
          },
          cumartesi: {
            opening: data.opening_time_saturday,
            closing: data.closing_time_saturday,
            isOpen: data.is_open_saturday ?? false
          },
          pazar: {
            opening: data.opening_time_sunday,
            closing: data.closing_time_sunday,
            isOpen: data.is_open_sunday ?? false
          }
        });
      }
    } catch (error) {
      console.error('Error loading professional working hours:', error);
      setAlertModal({
        isOpen: true,
        title: 'Hata',
        message: 'Ruh sağlığı uzmanının çalışma saatleri yüklenirken bir hata oluştu.'
      });
    }
  }

  // Günün müsait olup olmadığını kontrol eden fonksiyon
  const isDateAvailable = (date: Date) => {
    if (!selectedClient) return true;
    if (!selectedProfessionalId || !professionalWorkingHours) return false;

    const dayOfWeek = date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    
    const clinicDay = clinicHours[currentDay];
    const profDay = professionalWorkingHours[currentDay];

    if (!clinicDay || !profDay) return false;
    return clinicDay.isOpen && profDay.isOpen;
  };

  if (!isOpen) return null;

  return (
    <>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
      />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-6xl p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Yeni Randevu
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol Taraf - Danışan Seçimi */}
            <div className="space-y-6">
              {/* Danışan Arama */}
              <div className="relative" ref={searchRef}>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <label className="text-base font-medium text-gray-900 dark:text-white">
                    Danışan Ara
                  </label>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="İsim, telefon veya ruh sağlığı uzmanı..."
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchTerm && filteredClients.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => handleClientSelect(client)}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {client.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {client.phone && `Tel: ${client.phone}`}
                          {client.professional?.full_name && ` • Uzman: ${client.professional.full_name}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tarih Seçimi */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <label className="text-base font-medium text-gray-900 dark:text-white">
                    Tarih Seç
                  </label>
                </div>
                <div className="flex justify-center">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full max-w-[320px]">
                    <MantineProvider
                      theme={createTheme({
                        components: {
                          DatePicker: {
                            styles: {
                              calendar: { 
                                margin: '0',
                                backgroundColor: 'var(--mantine-color-body)'
                              },
                              calendarHeader: { 
                                margin: '0'
                              },
                              day: {
                                '&[data-selected="true"]': {
                                  backgroundColor: 'var(--mantine-color-blue-6)',
                                  color: 'var(--mantine-color-white)'
                                },
                                '&[data-disabled="true"]': {
                                  color: 'var(--mantine-color-gray-4)',
                                  backgroundColor: 'transparent'
                                }
                              }
                            }
                          }
                        }
                      })}
                    >
                      <DatePicker
                        value={selectedDate}
                        onChange={(date) => {
                          if (date) {
                            if (!selectedClient || isDateAvailable(date)) {
                              handleDateSelect(date);
                            }
                          }
                        }}
                        minDate={startOfToday()}
                        excludeDate={(date) => {
                          const now = startOfToday();
                          return date < now;
                        }}
                        locale="tr"
                        size="md"
                        className="w-full"
                        getDayProps={(date: Date) => ({
                          disabled: selectedClient ? !isDateAvailable(date) : false,
                          className: selectedClient && !isDateAvailable(date) ? 'opacity-30' : ''
                        })}
                      />
                    </MantineProvider>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Saat ve Oda Seçimi */}
            <div className="space-y-6">
              {/* Saat Seçimi */}
              {selectedDate && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <label className="text-base font-medium text-gray-900 dark:text-white">
                      Saat Seç
                    </label>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableTimeSlots.map((time) => {
                        const isDisabled = isTimeBeforeCurrent(time, selectedDate);
                        return (
                          <button
                            key={time}
                            onClick={() => !isDisabled && handleTimeSelect(time)}
                            disabled={isDisabled}
                            className={`p-3 rounded-lg text-center transition-all duration-200 ${
                              selectedTime === time
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                : isDisabled
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Oda Seçimi */}
              {selectedTime && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <label className="text-base font-medium text-gray-900 dark:text-white">
                      Oda Seç
                    </label>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableRooms.map((room) => (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room.id)}
                          className={`p-4 rounded-xl text-center transition-all duration-200 ${
                            selectedRoom === room.id
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                          }`}
                        >
                          <div className="font-medium">{room.name}</div>
                          {room.capacity > 1 && (
                            <div className="text-sm mt-1 opacity-75">
                              Kapasite: {room.capacity}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              İptal
            </button>
            <button
              onClick={handleCreateAppointment}
              disabled={!selectedClient || !selectedDate || !selectedTime || !selectedRoom || loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Oluşturuluyor...' : 'Randevu Oluştur'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 