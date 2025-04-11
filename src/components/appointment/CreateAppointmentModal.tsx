import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronRight, X, Calendar, Clock, Users, Home, Check, Search, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { format, addMinutes, set, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

// Spinner bileşeni
const Spinner = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${className}`} />
  );
};

// Modal props
interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId?: string;
  assistantId?: string;
  initialClientId?: string;
  onSuccess?: () => void;
  onAppointmentCreated?: () => void;
  externalClinicHours?: {
    pazartesi: { opening: string; closing: string; isOpen: boolean };
    sali: { opening: string; closing: string; isOpen: boolean };
    carsamba: { opening: string; closing: string; isOpen: boolean };
    persembe: { opening: string; closing: string; isOpen: boolean };
    cuma: { opening: string; closing: string; isOpen: boolean };
    cumartesi: { opening: string; closing: string; isOpen: boolean };
    pazar: { opening: string; closing: string; isOpen: boolean };
  };
}

// Veritabanı türleri
interface Professional {
  id: string;
  full_name: string;
  title: string;
  email: string;
  profile_image_url?: string;
}

interface Client {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
}

interface Appointment {
  id: string;
  professional_id: string;
  client_id: string;
  room_id?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  is_online: boolean;
}

interface WorkingHours {
  [key: string]: { 
    opening: string; 
    closing: string; 
    isOpen: boolean;
  };
}

interface Break {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  description?: string;
}

interface Vacation {
  id: string;
  start_date: string;
  end_date: string;
  title: string;
  description?: string;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  professionalId: initialProfessionalId,
  assistantId,
  initialClientId,
  onSuccess,
  onAppointmentCreated,
  externalClinicHours
}) => {
  // Form state
  const [step, setStep] = useState(initialClientId ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Randevu bilgileri
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(initialProfessionalId || null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Oda müsaitlik durumu
  const [roomAvailability, setRoomAvailability] = useState<{
    date: string;
    timeSlots: Record<string, string[]>; // Her saat için dolu olan odaların ID'leri
  } | null>(null);
  
  // Veri listeleri
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [internalClinicHours, setInternalClinicHours] = useState<WorkingHours | null>(null);
  const [professionalHours, setProfessionalHours] = useState<WorkingHours | null>(null);
  const [professionalBreaks, setProfessionalBreaks] = useState<Break[]>([]);
  const [clinicBreaks, setClinicBreaks] = useState<Break[]>([]);
  const [professionalVacations, setProfessionalVacations] = useState<Vacation[]>([]);
  const [clinicVacations, setClinicVacations] = useState<Vacation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth context
  const { user, professional, assistant } = useAuth();

  // Form durumu
  const [isLoading, setIsLoading] = useState({
    professionals: false,
    clients: false,
    timeSlots: false,
    rooms: false,
    submit: false
  });

  // Modal state'leri
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Oda müsaitlik hesaplaması için gereken değişkenler
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  // Müsait odaları hesapla - component seviyesinde
  const availableRoomsForSelection = useMemo(() => {
    if (isOnline || !selectedTime || !roomAvailability || roomAvailability.date !== selectedDateStr) {
      return rooms; // Online randevu veya oda müsaitlik verisi yoksa tüm odaları göster
    }
    
    // Seçilen saat için dolu odaların ID'leri
    const occupiedRoomIds = roomAvailability.timeSlots[selectedTime] || [];
    
    // Müsait odaları filtrele
    return rooms.filter(room => !occupiedRoomIds.includes(room.id));
  }, [rooms, isOnline, selectedTime, roomAvailability, selectedDateStr]);
  
  // Seçilen odanın müsait olup olmadığını kontrol et
  const isSelectedRoomAvailable = !selectedRoomId || 
    (availableRoomsForSelection.some(room => room.id === selectedRoomId));
  
  // Eğer seçilen oda müsait değilse, seçimi sıfırla
  useEffect(() => {
    if (selectedRoomId && !isSelectedRoomAvailable) {
      setSelectedRoomId(null);
    }
  }, [selectedRoomId, isSelectedRoomAvailable]);

  // Modal kapatıldığında formu sıfırla
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // İlk yüklemede verileri getir
  useEffect(() => {
    if (isOpen) {
      if (initialProfessionalId) {
        // Eğer profesyonel ID'si props olarak geldiyse
        setSelectedProfessionalId(initialProfessionalId);
        loadClients(initialProfessionalId);
        loadProfessionalWorkingHours(initialProfessionalId);
      } else if (professional) {
        // Eğer giriş yapan kullanıcı bir profesyonelse
        setSelectedProfessionalId(professional.id);
        loadClients(professional.id);
        loadProfessionalWorkingHours(professional.id);
      } else {
        // Diğer durumda profesyonelleri getir
        loadProfessionals();
      }

      // externalClinicHours prop'undan çalışma saatlerini ayarla
      if (externalClinicHours) {
        setInternalClinicHours(externalClinicHours as WorkingHours);
      } else {
        // Prop olarak çalışma saatleri gelmezse veritabanından yükle
        loadClinicWorkingHours();
      }
      
      // Tatil günlerini yükle
      loadVacations();
    }
  }, [isOpen, initialProfessionalId, professional, externalClinicHours]);

  // Adım 3'te müsait saatleri yükle
  useEffect(() => {
    if (step === 3 && selectedDate && selectedProfessionalId) {
      loadAvailableTimeSlots();
    }
  }, [step, selectedDate, selectedProfessionalId]);
  
  // Adım 4'te odaları yükle
  useEffect(() => {
    if (step === 4) {
      loadRooms();
    }
  }, [step]);

  // Müsait saatleri yükle
  const loadAvailableTimeSlots = async () => {
    if (!selectedDate || !selectedProfessionalId) return;
    
    setIsLoading(prev => ({ ...prev, timeSlots: true }));
    setError(null);
    
    try {
      // Belirlenen saat aralıkları (15'er dakika)
      const allTimeSlots = [
        '09:00', '09:15', '09:30', '09:45',
        '10:00', '10:15', '10:30', '10:45',
        '11:00', '11:15', '11:30', '11:45',
        '12:00', '12:15', '12:30', '12:45',
        '13:00', '13:15', '13:30', '13:45',
        '14:00', '14:15', '14:30', '14:45',
        '15:00', '15:15', '15:30', '15:45',
        '16:00', '16:15', '16:30', '16:45',
        '17:00', '17:15', '17:30', '17:45',
        '18:00', '18:15', '18:30', '18:45',
        '19:00', '19:15', '19:30', '19:45',
      ];
      
      // Seçili tarihteki randevuları getir
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      const startOfDayStr = `${selectedDateStr}T00:00:00`;
      const endOfDayStr = `${selectedDateStr}T23:59:59`;
      
      // Profesyonelin randevularını getir
      const { data: profAppointments, error: profAppError } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', selectedProfessionalId)
        .gte('start_time', startOfDayStr)
        .lte('start_time', endOfDayStr)
        .not('status', 'eq', 'cancelled'); // İptal edilmemiş randevular
      
      if (profAppError) {
        console.error('Profesyonel randevuları yüklenirken hata:', profAppError);
        throw profAppError;
      }
      
      // Haftanın günü (pazartesi, salı, vb.)
      const dayOfWeek = format(selectedDate, 'EEEE', { locale: tr }).toLowerCase();
      
      // Klinik çalışma saatleri
      const clinicDay = internalClinicHours?.[dayOfWeek];
      // Profesyonel çalışma saatleri
      const profDay = professionalHours?.[dayOfWeek];
      
      // Klinik veya profesyonel o gün çalışmıyorsa boş döndür
      if ((clinicDay && !clinicDay.isOpen) || (profDay && !profDay.isOpen)) {
        setAvailableTimeSlots([]);
        setIsLoading(prev => ({ ...prev, timeSlots: false }));
        return;
      }
      
      // Çalışma saatleri aralığı
      const clinicOpening = clinicDay?.opening || '09:00';
      const clinicClosing = clinicDay?.closing || '18:00';
      const profOpening = profDay?.opening || '09:00';
      const profClosing = profDay?.closing || '18:00';
      
      // Hem klinik hem de profesyonel için ortak çalışma saatleri aralığı
      const openingTime = profOpening > clinicOpening ? profOpening : clinicOpening;
      const closingTime = profClosing < clinicClosing ? profClosing : clinicClosing;
      
      // Randevu süresi (dakika)
      const sessionDuration = 45;
      
      // Müsait saatlerin filtrelenmesi
      const availableSlots = allTimeSlots.filter(time => {
        // Çalışma saatlerinin dışındaysa filtrele
        if (time < openingTime || time > closingTime) {
          return false;
        }
        
        // Randevunun bitiş saatini hesapla
        const startDateTime = new Date(`${selectedDateStr}T${time}`);
        const endDateTime = addMinutes(startDateTime, sessionDuration);
        const endTime = format(endDateTime, 'HH:mm');
        
        // Eğer randevu bitiş saati kapanış saatinden sonraysa filtrele
        if (endTime > closingTime) {
          return false;
        }
        
        // Çakışan randevuları kontrol et
        const hasConflict = profAppointments?.some(appointment => {
          const appStartTime = new Date(appointment.start_time);
          const appEndTime = new Date(appointment.end_time);
          
          // Randevu başlangıç anı, var olan bir randevuyla çakışıyor mu?
          const newAppointmentStart = new Date(`${selectedDateStr}T${time}`);
          const newAppointmentEnd = addMinutes(newAppointmentStart, sessionDuration);
          
          // Çakışma kontrolü: 
          // 1. Yeni randevunun başlangıcı mevcut randevular arasında mı?
          // 2. Yeni randevunun bitişi mevcut randevular arasında mı?
          // 3. Yeni randevu, mevcut randevuyu kapsıyor mu?
          return (
            (newAppointmentStart >= appStartTime && newAppointmentStart < appEndTime) ||
            (newAppointmentEnd > appStartTime && newAppointmentEnd <= appEndTime) ||
            (newAppointmentStart <= appStartTime && newAppointmentEnd >= appEndTime)
          );
        });
        
        // Çakışma yoksa bu saat müsait
        return !hasConflict;
      });
      
      // Odalar için ekstra kontrol (Adım 4'teki oda seçimine hazırlık)
      if (availableSlots.length > 0) {
        // Randevu oluşturulacak tüm odaların müsaitlik durumunu kontrol et
        const { data: roomAppointments, error: roomAppError } = await supabase
          .from('appointments')
          .select('room_id, start_time, end_time')
          .not('professional_id', 'eq', selectedProfessionalId) // Profesyonelin kendi randevuları zaten kontrol edildi
          .not('room_id', 'is', null) // Online olmayan randevular (null olmayan room_id'ler)
          .gte('start_time', startOfDayStr)
          .lte('start_time', endOfDayStr)
          .not('status', 'eq', 'cancelled');
        
        if (roomAppError) {
          console.error('Oda randevuları yüklenirken hata:', roomAppError);
        } else {
          // Oda müsaitliği bilgisini sakla
          setRoomAvailability({
            date: selectedDateStr,
            timeSlots: availableSlots.reduce((acc, time) => {
              const startDateTime = new Date(`${selectedDateStr}T${time}`);
              const endDateTime = addMinutes(startDateTime, sessionDuration);
              
              // Bu zaman diliminde hangi odalar dolu?
              const occupiedRooms = roomAppointments?.filter(appointment => {
                const appStartTime = new Date(appointment.start_time);
                const appEndTime = new Date(appointment.end_time);
                
                // Çakışma kontrolü
                return (
                  (startDateTime >= appStartTime && startDateTime < appEndTime) ||
                  (endDateTime > appStartTime && endDateTime <= appEndTime) ||
                  (startDateTime <= appStartTime && endDateTime >= appEndTime)
                );
              }).map(app => app.room_id) || [];
              
              acc[time] = occupiedRooms;
              return acc;
            }, {} as Record<string, string[]>)
          });
        }
      }
      
      setAvailableTimeSlots(availableSlots);
    } catch (err: any) {
      setError('Müsait saatler yüklenirken bir hata oluştu: ' + err.message);
      console.error('Müsait saatler yüklenirken bir hata oluştu:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, timeSlots: false }));
    }
  };

  // Form sıfırlama
  const resetForm = () => {
    setStep(1);
    setSelectedProfessionalId(initialProfessionalId || (professional ? professional.id : null));
    setSelectedClientId(initialClientId || (assistant ? assistant.id : null));
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedRoomId(null);
    setIsOnline(false);
    setNotes('');
    setError(null);
    setSearchQuery('');
  };

  // Profesyonelleri yükle
  const loadProfessionals = async () => {
    setIsLoading(prev => ({ ...prev, professionals: true }));
    setError(null);

    try {
      // Eğer asistan ID'si props olarak geldiyse, sadece o kliniktekileri getir
      let query = supabase.from('professionals').select('*');
      
      if (assistantId) {
        query = query.eq('assistant_id', assistantId);
      } else if (assistant) {
        query = query.eq('assistant_id', assistant.id);
      }

      const { data, error: fetchError } = await query.order('full_name');

      if (fetchError) {
        throw fetchError;
      }

      setProfessionals(data || []);
    } catch (err: any) {
      setError('Profesyoneller yüklenirken bir hata oluştu: ' + err.message);
      console.error('Profesyoneller yüklenirken bir hata oluştu:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, professionals: false }));
    }
  };

  // Danışanları yükle
  const loadClients = async (profId: string) => {
    setIsLoading(prev => ({ ...prev, clients: true }));
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('professional_id', profId)
        .order('full_name');

      if (fetchError) {
        throw fetchError;
      }

      setClients(data || []);
    } catch (err: any) {
      setError('Danışanlar yüklenirken bir hata oluştu: ' + err.message);
      console.error('Danışanlar yüklenirken bir hata oluştu:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, clients: false }));
    }
  };

  // Odaları yükle
  const loadRooms = async () => {
    setIsLoading(prev => ({ ...prev, rooms: true }));
    setError(null);

    try {
      let query = supabase.from('rooms').select('*');
      
      if (assistantId) {
        query = query.eq('assistant_id', assistantId);
      } else if (professional && professional.assistant_id) {
        query = query.eq('assistant_id', professional.assistant_id);
      } else if (assistant) {
        query = query.eq('assistant_id', assistant.id);
      }

      const { data, error: fetchError } = await query.order('name');

      if (fetchError) {
        throw fetchError;
      }

      setRooms(data || []);
    } catch (err: any) {
      setError('Odalar yüklenirken bir hata oluştu: ' + err.message);
      console.error('Odalar yüklenirken bir hata oluştu:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, rooms: false }));
    }
  };

  // Profesyonel seçildiğinde
  const handleProfessionalSelect = (profId: string) => {
    setSelectedProfessionalId(profId);
    loadClients(profId);
    loadProfessionalWorkingHours(profId);
    
    // Profesyonel değiştiğinde tatil günlerini tekrar yükle
    const loadProfessionalVacations = async () => {
      try {
        const { data, error } = await supabase
          .from('professional_vacations')
          .select('*')
          .eq('professional_id', profId);
        
        if (error) throw error;
        
        setProfessionalVacations(data || []);
      } catch (err) {
        console.error('Profesyonel tatil günleri yüklenirken hata:', err);
      }
    };
    
    loadProfessionalVacations();
    setSelectedClientId(null);
  };

  // Müşteri seçim adımı
  const renderClientSelection = () => {
    const filteredClients = clients.filter(client => 
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.phone && client.phone.includes(searchQuery))
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
          <Users className="h-5 w-5" />
          <h4 className="text-base font-medium">Danışan Seçimi</h4>
        </div>

        {/* Profesyonel seçimi gerekiyorsa */}
        {!professional && !initialProfessionalId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Profesyonel
            </label>
            <div className="max-h-36 overflow-y-auto rounded-md border border-slate-300 dark:border-slate-600">
              {isLoading.professionals ? (
                <div className="p-4 flex justify-center">
                  <Spinner size="sm" />
                </div>
              ) : professionals.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  Profesyonel bulunamadı
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {professionals.map((prof) => (
                    <div
                      key={prof.id}
                      className={`p-3 flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 
                        ${selectedProfessionalId === prof.id ? 'bg-slate-100 dark:bg-slate-700/70' : ''}`}
                      onClick={() => handleProfessionalSelect(prof.id)}
                    >
                      <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{prof.full_name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{prof.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Arama alanı */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>
          <input
            type="text"
            className="pl-10 w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2"
            placeholder="Danışan ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Danışan listesi */}
        <div className="max-h-60 overflow-y-auto rounded-md border border-slate-300 dark:border-slate-600">
          {isLoading.clients ? (
            <div className="p-4 flex justify-center">
              <Spinner size="sm" />
            </div>
          ) : !selectedProfessionalId ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Lütfen önce bir profesyonel seçin
            </div>
          ) : searchQuery.trim() === '' ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Danışan bulmak için bir arama yapın
            </div>
          ) : clients.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Bu profesyonel için kayıtlı danışan bulunamadı
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Aramanızla eşleşen danışan bulunamadı
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-3 flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 
                    ${selectedClientId === client.id ? 'bg-slate-100 dark:bg-slate-700/70' : ''}`}
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{client.full_name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {client.email || client.phone || 'İletişim bilgisi yok'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seçilen danışan bilgisi */}
        {selectedClientId && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md border border-primary-200 dark:border-primary-900/30">
            <div className="text-sm font-medium text-primary-700 dark:text-primary-400">
              Seçilen Danışan:
            </div>
            <div className="text-sm text-primary-800 dark:text-primary-300">
              {clients.find(c => c.id === selectedClientId)?.full_name}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tarih seçim adımı
  const renderDateSelection = () => {
    // Tarih seçimi için basit takvim bileşeni
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1)); // Pazartesi başlangıç
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (endDate.getDay() === 0 ? 0 : 7 - endDate.getDay())); // Pazar bitiş
    
    // Takvim başlıkları
    const dayHeaders = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
    
    // Takvim hücrelerini oluştur
    const createCalendarCells = () => {
      const cells = [];
      const day = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minDate = today; // Bugün ve sonrası için randevu alınabilir
      const maxDate = new Date(today);
      maxDate.setMonth(maxDate.getMonth() + 3); // 3 ay sonrası maksimum
      
      while (day <= endDate) {
        const formattedDate = format(day, "yyyy-MM-dd");
        const isToday = isSameDay(day, today);
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
        
        // Gün adını al (pazartesi, salı, vb.)
        const dayName = format(day, "EEEE", { locale: tr }).toLowerCase();
        
        // Varsayılan değerler - veri yoksa klinik ve profesyonel çalışıyor varsayılır
        // Bu şekilde erişim problemi olsa bile randevu oluşturulabilir
        const isClinicOpen = !internalClinicHours || !internalClinicHours[dayName] ? 
                             true : internalClinicHours[dayName].isOpen;
        
        const isProfessionalAvailable = !selectedProfessionalId || !professionalHours || !professionalHours[dayName] ? 
                                       true : professionalHours[dayName].isOpen;
        
        // Tatil günlerini kontrol et - veri yoksa tatil yok varsayılır
        const isVacationDay = Array.isArray(clinicVacations) && clinicVacations.length > 0 ? 
          clinicVacations.some(vacation => {
            const startDate = new Date(vacation.start_date);
            const endDate = new Date(vacation.end_date);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            return day >= startDate && day <= endDate;
          }) : false;
        
        // Profesyonelin tatil günlerini kontrol et
        const isProfessionalOnVacation = selectedProfessionalId && Array.isArray(professionalVacations) && professionalVacations.length > 0 ? 
          professionalVacations.some(vacation => {
            const startDate = new Date(vacation.start_date);
            const endDate = new Date(vacation.end_date);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            return day >= startDate && day <= endDate;
          }) : false;
        
        // Gün devre dışı bırakılmalı mı? 
        const isDisabled = isBefore(day, minDate) || isAfter(day, maxDate) || 
                          !isClinicOpen || !isProfessionalAvailable || 
                          isVacationDay || isProfessionalOnVacation;
                          
        // Neden kapandığını belirle
        let disabledReason = '';
        if (isBefore(day, minDate)) {
          disabledReason = 'Geçmiş tarihler için randevu oluşturulamaz';
        } else if (isAfter(day, maxDate)) {
          disabledReason = 'Çok ileri tarihler için randevu oluşturulamaz';
        } else if (!isClinicOpen) {
          disabledReason = 'Klinik bu gün kapalı';
        } else if (!isProfessionalAvailable) {
          disabledReason = 'Profesyonel bu gün çalışmıyor';
        } else if (isVacationDay) {
          disabledReason = 'Klinik tatil günü';
        } else if (isProfessionalOnVacation) {
          disabledReason = 'Profesyonel izin günü';
        }
        
        cells.push(
          <button
            key={formattedDate}
            onClick={() => {
              if (!isDisabled) {
                // Tarih string'i olarak alıp, yeni bir Date objesi oluşturuyoruz
                const newSelectedDate = new Date(formattedDate);
                setSelectedDate(newSelectedDate);
              }
            }}
            disabled={isDisabled}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
              isSelected 
                ? 'bg-primary-500 text-white' 
                : isToday
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                  : isCurrentMonth
                    ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50' 
                    : 'text-slate-400 dark:text-slate-500'
            } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            title={disabledReason}
          >
            {day.getDate()}
          </button>
        );
        
        day.setDate(day.getDate() + 1);
      }
      
      return cells;
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
          <Calendar className="h-5 w-5" />
          <h4 className="text-base font-medium">Tarih Seçimi</h4>
        </div>
        
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Lütfen randevu tarihini seçin.
        </div>
        
        <div className="rounded-md border border-slate-300 dark:border-slate-600 p-4">
          {/* Ay navigasyonu */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => {
                const prevMonth = new Date(currentMonth);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setCurrentMonth(prevMonth);
              }}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-5 w-5 transform rotate-180 text-slate-600 dark:text-slate-400" />
            </button>
            
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {format(currentMonth, "MMMM yyyy", { locale: tr })}
            </h3>
            
            <button
              onClick={() => {
                const nextMonth = new Date(currentMonth);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setCurrentMonth(nextMonth);
              }}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
          
          {/* Gün başlıkları */}
          <div className="grid grid-cols-7 mb-2">
            {dayHeaders.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>
          
          {/* Takvim günleri */}
          <div className="grid grid-cols-7 gap-1">
            {createCalendarCells()}
          </div>
        </div>
        
        {/* Seçilen tarih gösterimi */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md border border-primary-200 dark:border-primary-900/30">
            <div className="text-sm font-medium text-primary-700 dark:text-primary-400">
              Seçilen Tarih:
            </div>
            <div className="text-sm text-primary-800 dark:text-primary-300">
              {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Saat seçim adımı
  const renderTimeSelection = () => {
    // Randevu süreleri, varsayılan 45 dakika
    const sessionDuration = 45; // dakika
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
          <Clock className="h-5 w-5" />
          <h4 className="text-base font-medium">Saat Seçimi</h4>
        </div>
        
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {selectedDate && (
            <div className="font-medium">
              {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
            </div>
          )}
          <div className="mt-1">
            Lütfen randevu saatini seçin.
          </div>
        </div>
        
        <div className="rounded-md border border-slate-300 dark:border-slate-600 p-4">
          {isLoading.timeSlots ? (
            <div className="flex justify-center p-8">
              <Spinner />
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Seçilen tarih için müsait saat bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {availableTimeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-3 rounded-md text-sm font-medium 
                    ${selectedTime === time 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Seçilen saat gösterimi */}
        {selectedTime && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md border border-primary-200 dark:border-primary-900/30">
            <div className="text-sm font-medium text-primary-700 dark:text-primary-400">
              Seçilen Saat:
            </div>
            <div className="text-sm text-primary-800 dark:text-primary-300">
              {selectedTime}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Oda seçim adımı
  const renderRoomSelection = () => {
    // Oda seçimi sadece yüz yüze randevular için gerekli
    
    // Online randevu seçimini değiştirme
    const toggleOnlineAppointment = () => {
      setIsOnline(!isOnline);
      if (!isOnline) {
        // Online randevu seçildiyse, oda seçimini temizle
        setSelectedRoomId(null);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
          <Home className="h-5 w-5" />
          <h4 className="text-base font-medium">Oda Seçimi</h4>
        </div>
        
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <div>
            Randevu türünü seçin ve yüz yüze randevu için oda belirleyin.
          </div>
          {(!isOnline && selectedTime && availableRoomsForSelection.length === 0) && (
            <div className="mt-2 text-amber-600 dark:text-amber-400">
              Seçilen saat için müsait oda bulunmamaktadır. Lütfen online randevu oluşturun veya başka bir saat seçin.
            </div>
          )}
        </div>
        
        {/* Randevu türü seçimi */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Randevu Türü
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setIsOnline(false)}
              disabled={!isOnline && selectedTime && availableRoomsForSelection.length === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                !isOnline 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              } ${(!isOnline && selectedTime && availableRoomsForSelection.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Yüz Yüze
            </button>
            <button
              type="button"
              onClick={() => setIsOnline(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isOnline 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              Online
            </button>
          </div>
        </div>
        
        {/* Yüz yüze ise oda seçimi göster */}
        {!isOnline && (
          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Terapi Odası {availableRoomsForSelection.length > 0 && <span className="text-xs text-slate-500 dark:text-slate-400">({availableRoomsForSelection.length} müsait oda)</span>}
            </label>
            
            <div className="rounded-md border border-slate-300 dark:border-slate-600 overflow-hidden">
              {isLoading.rooms ? (
                <div className="flex justify-center p-8">
                  <Spinner />
                </div>
              ) : availableRoomsForSelection.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {selectedTime 
                    ? 'Seçilen saat için müsait oda bulunmamaktadır.' 
                    : 'Kayıtlı oda bulunamadı.'}
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {availableRoomsForSelection.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 
                        ${selectedRoomId === room.id ? 'bg-slate-100 dark:bg-slate-700/70' : ''}`}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                        <Home className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{room.name}</div>
                        {room.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">{room.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Seçilen oda veya online bilgisi */}
        {(selectedRoomId || isOnline) && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-md border border-primary-200 dark:border-primary-900/30">
            <div className="text-sm font-medium text-primary-700 dark:text-primary-400">
              Randevu Türü:
            </div>
            <div className="text-sm text-primary-800 dark:text-primary-300">
              {isOnline ? 'Online Görüşme' : `Yüz Yüze - ${rooms.find(r => r.id === selectedRoomId)?.name || ''}`}
            </div>
          </div>
        )}
        
        {/* Randevu notu */}
        <div className="mt-6">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
            Randevu Notu (Opsiyonel)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:border-primary-500 focus:ring-primary-500"
            placeholder="Randevu ile ilgili notlarınızı buraya yazabilirsiniz..."
          />
        </div>
      </div>
    );
  };

  // Onay adımı
  const renderConfirmation = () => {
    // Seçilen danışan
    const selectedClient = clients.find(c => c.id === selectedClientId);
    // Seçilen profesyonel
    const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId);
    // Randevu saati (45 dakikalık varsayılan süre)
    const appointmentEndTime = selectedTime ? 
      format(addMinutes(new Date(`${format(selectedDate!, 'yyyy-MM-dd')}T${selectedTime}`), 45), 'HH:mm') : '';

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
          <Check className="h-5 w-5" />
          <h4 className="text-base font-medium">Randevu Onayı</h4>
        </div>
        
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Lütfen randevu bilgilerini kontrol edip onaylayın.
        </div>
        
        <div className="rounded-md border border-slate-300 dark:border-slate-600 overflow-hidden">
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {/* Danışan bilgisi */}
            <div className="p-3">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Danışan
              </div>
              <div className="font-medium text-slate-900 dark:text-white">
                {selectedClient?.full_name || ''}
              </div>
            </div>
            
            {/* Profesyonel bilgisi */}
            <div className="p-3">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Profesyonel
              </div>
              <div className="font-medium text-slate-900 dark:text-white">
                {selectedProfessional?.full_name || ''}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {selectedProfessional?.title || ''}
              </div>
            </div>
            
            {/* Tarih bilgisi */}
            <div className="p-3">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tarih ve Saat
              </div>
              <div className="font-medium text-slate-900 dark:text-white">
                {selectedDate && format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {selectedTime} - {appointmentEndTime}
              </div>
            </div>
            
            {/* Randevu türü */}
            <div className="p-3">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Randevu Türü
              </div>
              <div className="font-medium text-slate-900 dark:text-white">
                {isOnline ? 'Online Görüşme' : 'Yüz Yüze Görüşme'}
              </div>
              {!isOnline && selectedRoomId && (
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Oda: {rooms.find(r => r.id === selectedRoomId)?.name || ''}
                </div>
              )}
            </div>
            
            {/* Notlar */}
            {notes && (
              <div className="p-3">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Notlar
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  {notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // İlerleme durumu
  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return !!selectedClientId;
      case 2:
        return !!selectedDate;
      case 3:
        return !!selectedTime;
      case 4:
        return isOnline || !!selectedRoomId;
      case 5:
        return true;
      default:
        return false;
    }
  };
  
  // İleri butonu tıklaması
  const handleNextStep = () => {
    if (isStepValid(step)) {
      setStep((prev) => prev + 1);
    }
  };
  
  // Geri butonu tıklaması
  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };
  
  // Form gönderimi
  const handleSubmit = async () => {
    if (!selectedClientId || !selectedProfessionalId || !selectedDate || !selectedTime) {
      setError("Tüm gerekli alanlar doldurulmalıdır.");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, submit: true }));
    setError(null);
    
    try {
      // Tarih ve saati birleştir, ISO formatında
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      // Açık zaman dilimi belirteci kullanarak kaydet
      const timezoneSuffix = "+03:00"; // Türkiye saati için UTC+3
      const startTimeStr = `${dateStr}T${selectedTime}:00${timezoneSuffix}`;
      
      // 45 dakika sonrası için bitiş saati
      const startTimeDate = new Date(`${dateStr}T${selectedTime}`);
      const endTimeDate = addMinutes(startTimeDate, 45);
      const endTimeStr = `${format(endTimeDate, "yyyy-MM-dd'T'HH:mm:00")}${timezoneSuffix}`;
      
      // Yeni randevu objesi
      const newAppointment = {
        client_id: selectedClientId,
        professional_id: selectedProfessionalId,
        room_id: isOnline ? null : selectedRoomId,
        start_time: startTimeStr,
        end_time: endTimeStr,
        status: "scheduled",
        notes: notes,
        is_online: isOnline,
        meeting_url: isOnline ? `https://psikoran.xyz/${selectedProfessionalId}-${Date.now()}` : null
      };
      
      // Randevuyu veritabanına ekle
      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      // Başarılı mesajı
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successMessage.innerHTML = `
        <div>Randevu başarıyla oluşturuldu!</div>
        <div class="text-sm">${format(selectedDate, "d MMMM yyyy", { locale: tr })}, ${selectedTime} - ${format(endTimeDate, "HH:mm")}</div>
        <div class="text-xs mt-1">Kaydedilen UTC+3 saati: ${selectedTime}</div>
      `;
      document.body.appendChild(successMessage);
      
      // 5 saniye sonra bildirimi kapat
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 5000);
      
      // Formu sıfırla ve modalı kapat
      resetForm();
      onClose();
      
      // Başarı callback'lerini çağır
      if (onSuccess) {
        onSuccess();
      }
      
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
    } catch (err: any) {
      setError('Randevu oluşturulurken bir hata oluştu: ' + err.message);
      console.error('Randevu oluşturulurken bir hata oluştu:', err);
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Klinik çalışma saatlerini yükle
  const loadClinicWorkingHours = async () => {
    try {
      // Klinik assistan ID'sine göre yükle
      let assistantId = null;
      
      if (assistant) {
        assistantId = assistant.id;
      } else if (professional && professional.assistant_id) {
        assistantId = professional.assistant_id;
      }
      
      if (!assistantId) {
        // Varsayılan çalışma saatleri
        setInternalClinicHours({
          pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
          sali: { opening: '09:00', closing: '18:00', isOpen: true },
          carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
          persembe: { opening: '09:00', closing: '18:00', isOpen: true },
          cuma: { opening: '09:00', closing: '18:00', isOpen: true },
          cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
          pazar: { opening: '09:00', closing: '18:00', isOpen: false },
        });
        return;
      }
      
      try {
        // "clinic_settings" tablosundan veri çekmeyi dene, clinic_hours yerine
        const { data, error } = await supabase
          .from('clinic_settings')
          .select('*')
          .eq('assistant_id', assistantId)
          .single();
        
        if (error) {
          console.error('Klinik ayarları yüklenirken hata:', error);
          // Hata durumunda varsayılan saatleri kullan
          setInternalClinicHours({
            pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
            sali: { opening: '09:00', closing: '18:00', isOpen: true },
            carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
            persembe: { opening: '09:00', closing: '18:00', isOpen: true },
            cuma: { opening: '09:00', closing: '18:00', isOpen: true },
            cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
            pazar: { opening: '09:00', closing: '18:00', isOpen: false },
          });
          return;
        }
        
        if (data) {
          // Önce working_hours JSONB alanını kontrol et
          if (data.working_hours) {
            setInternalClinicHours(data.working_hours as unknown as WorkingHours);
          } else {
            // Verileri manuel olarak dönüştür
            const workingHours: WorkingHours = {
              pazartesi: { 
                opening: data.opening_time_monday || '09:00', 
                closing: data.closing_time_monday || '18:00', 
                isOpen: !!data.is_open_monday 
              },
              sali: { 
                opening: data.opening_time_tuesday || '09:00', 
                closing: data.closing_time_tuesday || '18:00', 
                isOpen: !!data.is_open_tuesday 
              },
              carsamba: { 
                opening: data.opening_time_wednesday || '09:00', 
                closing: data.closing_time_wednesday || '18:00', 
                isOpen: !!data.is_open_wednesday 
              },
              persembe: { 
                opening: data.opening_time_thursday || '09:00', 
                closing: data.closing_time_thursday || '18:00', 
                isOpen: !!data.is_open_thursday 
              },
              cuma: { 
                opening: data.opening_time_friday || '09:00', 
                closing: data.closing_time_friday || '18:00', 
                isOpen: !!data.is_open_friday 
              },
              cumartesi: { 
                opening: data.opening_time_saturday || '09:00', 
                closing: data.closing_time_saturday || '18:00', 
                isOpen: !!data.is_open_saturday 
              },
              pazar: { 
                opening: data.opening_time_sunday || '09:00', 
                closing: data.closing_time_sunday || '18:00', 
                isOpen: !!data.is_open_sunday 
              },
            };
            setInternalClinicHours(workingHours);
          }
        } else {
          // Veri yoksa varsayılan saatleri kullan
          setInternalClinicHours({
            pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
            sali: { opening: '09:00', closing: '18:00', isOpen: true },
            carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
            persembe: { opening: '09:00', closing: '18:00', isOpen: true },
            cuma: { opening: '09:00', closing: '18:00', isOpen: true },
            cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
            pazar: { opening: '09:00', closing: '18:00', isOpen: false },
          });
        }
      } catch (err) {
        console.error('Klinik çalışma saatleri yüklenirken hata:', err);
        // Hata durumunda varsayılan saatleri kullan
        setInternalClinicHours({
          pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
          sali: { opening: '09:00', closing: '18:00', isOpen: true },
          carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
          persembe: { opening: '09:00', closing: '18:00', isOpen: true },
          cuma: { opening: '09:00', closing: '18:00', isOpen: true },
          cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
          pazar: { opening: '09:00', closing: '18:00', isOpen: false },
        });
      }
    } catch (err) {
      console.error('Klinik çalışma saatleri yüklenirken hata:', err);
      // Hata durumunda varsayılan saatleri kullan
      setInternalClinicHours({
        pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
        sali: { opening: '09:00', closing: '18:00', isOpen: true },
        carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
        persembe: { opening: '09:00', closing: '18:00', isOpen: true },
        cuma: { opening: '09:00', closing: '18:00', isOpen: true },
        cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
        pazar: { opening: '09:00', closing: '18:00', isOpen: false },
      });
    }
  };
  
  // Profesyonel çalışma saatlerini yükle
  const loadProfessionalWorkingHours = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from('professional_working_hours')
        .select('*')
        .eq('professional_id', profId);
      
      if (error) {
        console.error('Profesyonel çalışma saatleri yüklenirken hata:', error);
        // Hata durumunda varsayılan saatleri kullan
        setProfessionalHours({
          pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
          sali: { opening: '09:00', closing: '18:00', isOpen: true },
          carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
          persembe: { opening: '09:00', closing: '18:00', isOpen: true },
          cuma: { opening: '09:00', closing: '18:00', isOpen: true },
          cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
          pazar: { opening: '09:00', closing: '18:00', isOpen: false },
        });
        return;
      }
      
      if (data && data.length > 0) {
        // SQL dosyasında "hours" adında JSONB alanı var
        const profHours = data[0]?.hours;
        if (profHours) {
          setProfessionalHours(profHours as WorkingHours);
        } else {
          // hours alanı boşsa, verileri manuel olarak dönüştürelim
          const workingHours: WorkingHours = {
            pazartesi: { 
              opening: data[0].opening_time_monday || '09:00', 
              closing: data[0].closing_time_monday || '18:00', 
              isOpen: data[0].is_open_monday || true  // Varsayılan olarak true
            },
            sali: { 
              opening: data[0].opening_time_tuesday || '09:00', 
              closing: data[0].closing_time_tuesday || '18:00', 
              isOpen: data[0].is_open_tuesday || true 
            },
            carsamba: { 
              opening: data[0].opening_time_wednesday || '09:00', 
              closing: data[0].closing_time_wednesday || '18:00', 
              isOpen: data[0].is_open_wednesday || true 
            },
            persembe: { 
              opening: data[0].opening_time_thursday || '09:00', 
              closing: data[0].closing_time_thursday || '18:00', 
              isOpen: data[0].is_open_thursday || true 
            },
            cuma: { 
              opening: data[0].opening_time_friday || '09:00', 
              closing: data[0].closing_time_friday || '18:00', 
              isOpen: data[0].is_open_friday || true 
            },
            cumartesi: { 
              opening: data[0].opening_time_saturday || '09:00', 
              closing: data[0].closing_time_saturday || '18:00', 
              isOpen: data[0].is_open_saturday || false 
            },
            pazar: { 
              opening: data[0].opening_time_sunday || '09:00', 
              closing: data[0].closing_time_sunday || '18:00', 
              isOpen: data[0].is_open_sunday || false 
            },
          };
          
          setProfessionalHours(workingHours);
        }
      } else {
        // Veri yoksa varsayılan saatleri kullan
        setProfessionalHours({
          pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
          sali: { opening: '09:00', closing: '18:00', isOpen: true },
          carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
          persembe: { opening: '09:00', closing: '18:00', isOpen: true },
          cuma: { opening: '09:00', closing: '18:00', isOpen: true },
          cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
          pazar: { opening: '09:00', closing: '18:00', isOpen: false },
        });
      }
    } catch (err) {
      console.error('Profesyonel çalışma saatleri yüklenirken hata:', err);
      // Hata durumunda varsayılan saatleri kullan
      setProfessionalHours({
        pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
        sali: { opening: '09:00', closing: '18:00', isOpen: true },
        carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
        persembe: { opening: '09:00', closing: '18:00', isOpen: true },
        cuma: { opening: '09:00', closing: '18:00', isOpen: true },
        cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
        pazar: { opening: '09:00', closing: '18:00', isOpen: false },
      });
    }
  };
  
  // Tatil günlerini yükle - "vacations" ortak tablosunu kullanarak
  const loadVacations = async () => {
    try {
      // Klinik için tatil günlerini yükle
      let assistantId = null;
      
      if (assistant) {
        assistantId = assistant.id;
      } else if (professional && professional.assistant_id) {
        assistantId = professional.assistant_id;
      }
      
      if (assistantId) {
        try {
          // "vacations" tablosunu kullan çünkü RLS politikaları bu tabloda düzgün çalışıyor olabilir
          const { data, error } = await supabase
            .from('vacations')
            .select('*')
            .eq('clinic_id', assistantId);
          
          if (!error) {
            setClinicVacations(data || []);
          } else {
            console.error('Klinik tatil günleri yüklenirken hata:', error);
            setClinicVacations([]);
          }
        } catch (err) {
          console.error('Klinik tatil günleri yüklenirken hata:', err);
          setClinicVacations([]);
        }
      }
      
      // Profesyonel için izin günlerini yükle
      if (selectedProfessionalId) {
        try {
          // "vacations" tablosunu kullan
          const { data, error } = await supabase
            .from('vacations')
            .select('*')
            .eq('professional_id', selectedProfessionalId);
          
          if (!error) {
            setProfessionalVacations(data || []);
          } else {
            console.error('Profesyonel tatil günleri yüklenirken hata:', error);
            setProfessionalVacations([]);
          }
        } catch (err) {
          console.error('Profesyonel tatil günleri yüklenirken hata:', err);
          setProfessionalVacations([]);
        }
      }
    } catch (err) {
      console.error('Tatil günleri yüklenirken hata:', err);
      // Hataya karşı boş dizilerle devam edelim
      setClinicVacations([]);
      setProfessionalVacations([]);
    }
  };

  // Modal içeriği
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderClientSelection();
      case 2:
        return renderDateSelection();
      case 3:
        return renderTimeSelection();
      case 4:
        return renderRoomSelection();
      case 5:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-slate-900 dark:text-white flex justify-between items-center"
                >
                  <span>Yeni Randevu Oluştur</span>
                  <button
                    type="button"
                    className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  </button>
                </Dialog.Title>
                
                {/* Adım göstergesi */}
                <div className="flex justify-between mt-4 mb-6">
                  {[1, 2, 3, 4, 5].map((stepNumber) => (
                    <div key={stepNumber} className="flex flex-col items-center">
                      <div 
                        className={`h-8 w-8 rounded-full flex items-center justify-center 
                          ${step > stepNumber 
                            ? 'bg-primary-500 text-white' 
                            : step === stepNumber 
                              ? 'bg-primary-100 text-primary-600 border-2 border-primary-500 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-500' 
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}
                      >
                        {step > stepNumber ? <Check className="h-5 w-5" /> : stepNumber}
                      </div>
                      <div className={`h-1 w-12 ${stepNumber < 5 ? 'block' : 'hidden'}`}>
                        {stepNumber < 5 && (
                          <div className={`h-0.5 mt-4 ${step > stepNumber ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Hata mesajı */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                    {error}
                  </div>
                )}
                
                {/* Adım içeriği */}
                <div className="mt-2">
                  {renderStepContent()}
                </div>
                
                {/* Navigasyon butonları */}
                <div className="mt-6 flex justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-white"
                    >
                      Geri
                    </button>
                  ) : (
                    <div></div>
                  )}
                  
                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!isStepValid(step) || isLoading.submit}
                      className={`px-4 py-2 text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                        ${isStepValid(step) 
                          ? 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700' 
                          : 'bg-primary-400 cursor-not-allowed dark:bg-primary-700/50'}`}
                    >
                      İleri
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading.submit}
                      className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-offset-slate-800"
                    >
                      {isLoading.submit ? (
                        <div className="flex items-center">
                          <Spinner size="sm" className="mr-2" />
                          <span>Kaydediliyor...</span>
                        </div>
                      ) : (
                        "Randevuyu Oluştur"
                      )}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// Bileşeni dışa aktar
export default CreateAppointmentModal;