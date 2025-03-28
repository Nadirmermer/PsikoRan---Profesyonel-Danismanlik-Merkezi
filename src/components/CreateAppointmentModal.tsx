import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  Users,
  Home,
  PencilLine,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Video,
  Search,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { format, isValid, parseISO, isWithinInterval, addMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';
import dayjs, { Dayjs } from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId?: string;
  assistantId?: string;
  onSuccess?: () => void;
}

interface Client {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  professional_id: string;
}

interface Professional {
  id: string;
  full_name: string;
  assistant_id: string;
}

interface Room {
  id: string;
  name: string;
  assistant_id: string;
}

interface ClinicHours {
  pazartesi: {
    opening: string;
    closing: string;
    isOpen: boolean;
  };
  sali: {
    opening: string;
    closing: string;
    isOpen: boolean;
  };
  carsamba: {
    opening: string;
    closing: string;
    isOpen: boolean;
  };
  persembe: {
    opening: string;
    closing: string;
    isOpen: boolean;
  };
  cuma: {
    opening: string;
    closing: string;
    isOpen: boolean;
  };
  cumartesi: {
    opening: string;
    closing: string;
    isOpen: boolean;
  };
  pazar: {
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

interface Appointment {
  id: string;
  client_id: string;
  professional_id: string;
  room_id?: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  is_online: boolean;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  professionalId,
  assistantId,
  onSuccess
}: CreateAppointmentModalProps) {
  // Adım takibi için state
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Form durumu
  const [formData, setFormData] = useState({
    clientId: '',
    professionalId: professionalId || '',
    roomId: '',
    date: new Date(), // Date tipinde tutuyoruz
    time: '',
    duration: '45', // Varsayılan 45 dakika
    notes: '',
    isOnline: false
  });

  // MUI DateCalendar için dayjs state'i
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(new Date()));
  
  // Dark mode state'i
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  // MUI teması
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  });

  // UI durumları
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Veri durumları
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clinicHours, setClinicHours] = useState<ClinicHours | null>(null);
  const [professionalWorkingHours, setProfessionalWorkingHours] = useState<ClinicHours | null>(null);
  const [professionalBreaks, setProfessionalBreaks] = useState<Break[]>([]);
  const [clinicBreaks, setClinicBreaks] = useState<Break[]>([]);
  const [professionalVacations, setProfessionalVacations] = useState<Vacation[]>([]);
  const [clinicVacations, setClinicVacations] = useState<Vacation[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // Danışan arama state'i
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Seçili danışanı bulma
  const selectedClient = formData.clientId ? clients.find(c => c.id === formData.clientId) : null;

  // useEffect içinde, combobox kapandığında veya danışan değiştiğinde, 
  // seçili danışanın adını input'a ayarla
  useEffect(() => {
    if (selectedClient && !dropdownOpen) {
      setSearchTerm(selectedClient.full_name);
    }
  }, [selectedClient, dropdownOpen]);

  // Tıklamaları izle ve dışarıdaki tıklamalarda dropdown'ı kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Arama terimine göre filtrelenmiş danışanlar
  const filteredClients = clients.filter(client => 
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Modal açıldığında sadece ilk adım için veri yükleme
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, professionalId, assistantId]);

  // Her adım değiştiğinde ilgili verileri yükle
  useEffect(() => {
    if (isOpen) {
      handleStepDataLoad();
    }
  }, [currentStep, isOpen]);

  // Adım değiştiğinde gerekli verileri yükle
  const handleStepDataLoad = async () => {
    setStepLoading(true);
    setError(null);
    
    try {
      switch (currentStep) {
        case 1:
          // 1. Adım - Danışan seçimi
          if (clients.length === 0) {
            await loadClients();
          }
          break;
        case 2:
          // 2. Adım - Tarih seçimi
          if (formData.clientId) {
            await loadClinicHours();
            await loadClinicVacations();
            
            if (formData.professionalId) {
              await loadProfessionalWorkingHours(formData.professionalId);
              await loadProfessionalVacations(formData.professionalId);
            }
          }
          break;
        case 3:
          // 3. Adım - Saat seçimi
          if (formData.clientId && formData.date) {
            await loadClinicBreaks();
            if (formData.professionalId) {
              await loadProfessionalBreaks(formData.professionalId);
            }
            await loadAppointmentsForDate(format(formData.date, 'yyyy-MM-dd'));
            calculateAvailableTimeSlots(formData.date);
          }
          break;
        case 4:
          // 4. Adım - Oda seçimi
          if (formData.time) {
            if (rooms.length === 0) {
              await loadRooms();
            }
            calculateAvailableRooms();
          }
          break;
      }
    } catch (error) {
      console.error(`Adım ${currentStep} verileri yüklenirken hata:`, error);
      setError(`Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.`);
    } finally {
      setStepLoading(false);
    }
  };
  
  // İlk yükleme - Sadece temel verileri yükle
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // İlk adım için client verilerini yükle
        await loadClients();
      
      // Profesyonel ID varsa ayarla
      if (professionalId) {
        setFormData(prev => ({ ...prev, professionalId }));
      } 
      // Asistan ID varsa, asistana bağlı uzmanları yükle
      else if (assistantId) {
          await loadProfessionals();
      }
    } catch (error) {
      console.error('Başlangıç verileri yüklenirken hata oluştu:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Validate current step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.clientId; // Danışan seçilmiş olmalı
      case 2:
        return !!formData.date; // Tarih seçilmiş olmalı
      case 3:
        return !!formData.time; // Saat seçilmiş olmalı
      case 4:
        return formData.isOnline || !!formData.roomId; // Online veya oda seçilmiş olmalı
      default:
        return false;
    }
  };

  // Sonraki adıma geç
  const goToNextStep = () => {
    if (currentStep < 5 && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Önceki adıma dön
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Dark mode değişimini izle
  useEffect(() => {
    const updateThemeMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // İlk render'da ve DOM değişimlerinde kontrol et
    updateThemeMode();
    
    // MutationObserver ile dark class'ını dinle
    if (typeof window !== 'undefined') {
      const observer = new MutationObserver(updateThemeMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // Danışan verilerini yükle
  const loadClients = async () => {
    try {
      let query = supabase.from('clients').select('*').order('full_name');
      
      // Eğer sabit bir professional_id varsa, sadece o profesyonelin danışanlarını göster
      if (professionalId) {
        query = query.eq('professional_id', professionalId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setClients(data || []);
      
      // Profesyonel ID'si ayarlanmamışsa ve seçilen danışan varsa, danışanın profesyonelini ayarla
      if (!formData.professionalId && formData.clientId) {
        const selectedClient = data?.find(client => client.id === formData.clientId);
        if (selectedClient) {
          setFormData(prev => ({ ...prev, professionalId: selectedClient.professional_id }));
        }
      }
    } catch (error) {
      console.error('Danışanlar yüklenirken hata oluştu:', error);
      setError('Danışan listesi yüklenirken bir hata oluştu.');
    }
  };

  // Profesyonel verilerini yükle
  const loadProfessionals = async () => {
    try {
      let query = supabase.from('professionals').select('*').order('full_name');
      
      // Eğer assistant_id varsa, sadece o asistana bağlı profesyonelleri göster
      if (assistantId) {
        query = query.eq('assistant_id', assistantId);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      
      setProfessionals(data || []);
    } catch (error) {
      console.error('Profesyoneller yüklenirken hata oluştu:', error);
      setError('Uzman listesi yüklenirken bir hata oluştu.');
      }
  };

  // Oda verilerini yükle
  const loadRooms = async () => {
    try {
      // Önce "online" odasını yükle veya oluştur
      const onlineRoom = {
        id: 'online',
        name: 'Online Görüşme',
        assistant_id: assistantId || ''
      };
      
      let query = supabase.from('rooms').select('*').order('name');
      
      // Eğer assistant_id varsa, sadece o asistana bağlı odaları göster
      if (assistantId) {
        query = query.eq('assistant_id', assistantId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Online odayı ve fiziksel odaları birleştir
      setRooms([onlineRoom, ...(data || [])]);
    } catch (error) {
      console.error('Odalar yüklenirken hata oluştu:', error);
      setError('Oda listesi yüklenirken bir hata oluştu.');
    }
  };

  // Klinik çalışma saatlerini yükle
  const loadClinicHours = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_hours')
        .select('*')
        .single();
        
      if (error) throw error;
      
      setClinicHours(data);
    } catch (error) {
      console.error('Klinik çalışma saatleri yüklenirken hata oluştu:', error);
      setError('Klinik çalışma saatleri yüklenirken bir hata oluştu.');
    }
  };

  // Profesyonel çalışma saatlerini yükle
  const loadProfessionalWorkingHours = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from('professional_working_hours')
        .select('*')
        .eq('professional_id', profId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Veri bulunamadı, klinik saatlerini kullan
          setProfessionalWorkingHours(clinicHours);
          return;
        }
        throw error;
      }
      
      setProfessionalWorkingHours(data);
    } catch (error) {
      console.error('Profesyonel çalışma saatleri yüklenirken hata oluştu:', error);
      setError('Uzman çalışma saatleri yüklenirken bir hata oluştu.');
    }
  };

  // Profesyonel mola saatlerini yükle
  const loadProfessionalBreaks = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from('professional_breaks')
        .select('*')
        .eq('professional_id', profId);
        
      if (error) throw error;
      
      setProfessionalBreaks(data || []);
    } catch (error) {
      console.error('Profesyonel mola saatleri yüklenirken hata oluştu:', error);
      setError('Uzman mola saatleri yüklenirken bir hata oluştu.');
    }
  };

  // Klinik mola saatlerini yükle
  const loadClinicBreaks = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_breaks')
        .select('*');
        
      if (error) throw error;
      
      setClinicBreaks(data || []);
    } catch (error) {
      console.error('Klinik mola saatleri yüklenirken hata oluştu:', error);
      setError('Klinik mola saatleri yüklenirken bir hata oluştu.');
    }
  };

  // Profesyonel tatillerini yükle
  const loadProfessionalVacations = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from('professional_vacations')
        .select('*')
        .eq('professional_id', profId);

      if (error) throw error;
      
      setProfessionalVacations(data || []);
    } catch (error) {
      console.error('Profesyonel tatilleri yüklenirken hata oluştu:', error);
      setError('Uzman tatil bilgileri yüklenirken bir hata oluştu.');
    }
  };

  // Klinik tatillerini yükle
  const loadClinicVacations = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_vacations')
        .select('*');

      if (error) throw error;
      
      setClinicVacations(data || []);
    } catch (error) {
      console.error('Klinik tatilleri yüklenirken hata oluştu:', error);
      setError('Klinik tatil bilgileri yüklenirken bir hata oluştu.');
    }
  };

  // Seçili tarih için randevuları yükle
  const loadAppointmentsForDate = async (date: string) => {
    try {
      // Günün başlangıç ve bitiş saatleri
      const startOfDay = `${date}T00:00:00`;
      const endOfDay = `${date}T23:59:59`;

      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients(id, full_name),
          professionals(id, full_name)
        `)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .not('status', 'eq', 'cancelled');
      
      // Eğer sabit bir professional_id varsa, sadece o profesyonelin randevularını göster
      if (formData.professionalId) {
        query = query.eq('professional_id', formData.professionalId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      setExistingAppointments(data || []);
    } catch (error) {
      console.error('Randevular yüklenirken hata oluştu:', error);
      setError('Mevcut randevular yüklenirken bir hata oluştu.');
    }
  };

  // Kliniğin açık olup olmadığını kontrol et
  const isClinicOpen = (date: Date): boolean => {
    if (!clinicHours) return false;
    
    // Tarih tatil gününe denk geliyorsa, klinik kapalıdır
    if (isDateInVacations(date)) return false;
    
    // Haftanın günü
    const dayOfWeek = date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    
    // Klinik çalışma saatleri
    const dayHours = clinicHours[currentDay];
    
    // Kliniğin o gün açık olup olmadığını kontrol et
    return dayHours.isOpen;
  };

  // Tarihin tatil gününe denk gelip gelmediğini kontrol et
  const isDateInVacations = (date: Date): boolean => {
    if (!isValid(date)) return false;
    
    // Profesyonel tatilleri
    for (const vacation of professionalVacations) {
      const startDate = new Date(vacation.start_date);
      const endDate = new Date(vacation.end_date);
      
      if (isWithinInterval(date, { start: startDate, end: endDate })) {
      return true;
    }
    }
    
    // Klinik tatilleri
    for (const vacation of clinicVacations) {
      const startDate = new Date(vacation.start_date);
      const endDate = new Date(vacation.end_date);
      
      if (isWithinInterval(date, { start: startDate, end: endDate })) {
        return true;
      }
    }
    
    return false;
  };

  // Saat diliminin mola saatlerine denk gelip gelmediğini kontrol et
  const isTimeInBreaks = (hour: number, minute: number): boolean => {
    const timeInMinutes = hour * 60 + minute;
    
    // Günün adını al
    const dayOfWeek = formData.date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    
    // Profesyonel molaları
    const profBreaksForDay = professionalBreaks.filter(b => b.day_of_week === currentDay);
    for (const breakItem of profBreaksForDay) {
      const [startHour, startMinute] = breakItem.start_time.split(':').map(Number);
      const [endHour, endMinute] = breakItem.end_time.split(':').map(Number);
      
      const breakStartInMinutes = startHour * 60 + startMinute;
      const breakEndInMinutes = endHour * 60 + endMinute;
      
      if (timeInMinutes >= breakStartInMinutes && timeInMinutes < breakEndInMinutes) {
        return true;
      }
    }
    
    // Klinik molaları
    const clinicBreaksForDay = clinicBreaks.filter(b => b.day_of_week === currentDay);
    for (const breakItem of clinicBreaksForDay) {
      const [startHour, startMinute] = breakItem.start_time.split(':').map(Number);
      const [endHour, endMinute] = breakItem.end_time.split(':').map(Number);
      
      const breakStartInMinutes = startHour * 60 + startMinute;
      const breakEndInMinutes = endHour * 60 + endMinute;
      
      if (timeInMinutes >= breakStartInMinutes && timeInMinutes < breakEndInMinutes) {
        return true;
      }
    }
    
    return false;
  };

  // Kullanılabilir zaman dilimlerini hesapla
  const calculateAvailableTimeSlots = (date: Date) => {
    if (!clinicHours || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    // Tarihin tatil gününe denk gelip gelmediğini kontrol et
    if (isDateInVacations(date)) {
      setAvailableTimeSlots([]);
      return;
    }
    
    // Haftanın günü
    const dayOfWeek = date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    
    // Klinik çalışma saatleri
    const clinicDayHours = clinicHours[currentDay];

    // Klinik kapalıysa, boş dizi döndür
    if (!clinicDayHours.isOpen) {
      setAvailableTimeSlots([]);
      return;
    }
    
    // Profesyonel çalışma saatleri
    let openingHour, openingMinute, closingHour, closingMinute;
    
    if (formData.professionalId && professionalWorkingHours) {
      const profHours = professionalWorkingHours[currentDay];
      
      // Profesyonel o gün çalışmıyorsa, boş dizi döndür
      if (!profHours.isOpen) {
        setAvailableTimeSlots([]);
        return;
      }
      
      // Profesyonel ve klinik çalışma saatlerinin kesişimini al
      [openingHour, openingMinute = 0] = profHours.opening.split(':').map(Number);
      [closingHour, closingMinute = 0] = profHours.closing.split(':').map(Number);
      
      const [clinicOpenHour, clinicOpenMinute = 0] = clinicDayHours.opening.split(':').map(Number);
      const [clinicCloseHour, clinicCloseMinute = 0] = clinicDayHours.closing.split(':').map(Number);
      
      // En geç başlangıç saatini al
      if (clinicOpenHour > openingHour || (clinicOpenHour === openingHour && clinicOpenMinute > openingMinute)) {
        openingHour = clinicOpenHour;
        openingMinute = clinicOpenMinute;
      }
      
      // En erken bitiş saatini al
      if (clinicCloseHour < closingHour || (clinicCloseHour === closingHour && clinicCloseMinute < closingMinute)) {
        closingHour = clinicCloseHour;
        closingMinute = clinicCloseMinute;
      }
    } else {
      // Sadece klinik çalışma saatlerini kullan
      [openingHour, openingMinute = 0] = clinicDayHours.opening.split(':').map(Number);
      [closingHour, closingMinute = 0] = clinicDayHours.closing.split(':').map(Number);
    }
    
    // Başlangıç dakikasını bir sonraki tam saate yuvarla
    if (openingMinute > 0) {
      openingHour += 1;
      openingMinute = 0;
    }
    
    const slots: string[] = [];
    let currentHour = openingHour;
    let currentMinute = openingMinute;
    
    // Randevu süresi (dakika)
    const durationMinutes = parseInt(formData.duration, 10);
    
    // Her saat için 0 ve 30 dakika başlangıçlı randevu dilimleri oluştur
    while (currentHour < closingHour || (currentHour === closingHour && currentMinute < closingMinute)) {
      // Mola zamanı kontrolü
      if (!isTimeInBreaks(currentHour, currentMinute)) {
        // Randevu bitiş zamanını hesapla
        const endTimeInMinutes = currentHour * 60 + currentMinute + durationMinutes;
        const endHour = Math.floor(endTimeInMinutes / 60);
        const endMinute = endTimeInMinutes % 60;
        
        // Randevu bitiş zamanı çalışma saatleri içinde mi?
        if (endHour < closingHour || (endHour === closingHour && endMinute <= closingMinute)) {
          // Mevcut randevularla çakışma kontrolü
          let hasConflict = false;
          
          const startTime = `${formData.date.toISOString().split('T')[0]}T${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`;
          const endTime = `${formData.date.toISOString().split('T')[0]}T${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
          
          for (const appointment of existingAppointments) {
            const apptStartTime = new Date(appointment.start_time).getTime();
            const apptEndTime = new Date(appointment.end_time).getTime();
            const newStartTime = new Date(startTime).getTime();
            const newEndTime = new Date(endTime).getTime();
            
            // Çakışma kontrolü
            if (
              (newStartTime >= apptStartTime && newStartTime < apptEndTime) || // Başlangıç zamanı çakışıyor
              (newEndTime > apptStartTime && newEndTime <= apptEndTime) || // Bitiş zamanı çakışıyor
              (newStartTime <= apptStartTime && newEndTime >= apptEndTime) // İçine alıyor
            ) {
              hasConflict = true;
        break;
            }
          }
          
          if (!hasConflict) {
            slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
          }
        }
      }
      
      // Sonraki zaman dilimi (30 dakika artır)
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    setAvailableTimeSlots(slots);
  };

  // Kullanılabilir odaları hesapla
  const calculateAvailableRooms = () => {
    if (!formData.date || !formData.time) {
      setAvailableRooms([]);
      return [];
    }
    
    // Randevu başlangıç ve bitiş zamanlarını hesapla
    const [hour, minute] = formData.time.split(':').map(Number);
    const durationMinutes = parseInt(formData.duration, 10);
    
    const startTimeInMinutes = hour * 60 + minute;
    const endTimeInMinutes = startTimeInMinutes + durationMinutes;
    
    const endHour = Math.floor(endTimeInMinutes / 60);
    const endMinute = endTimeInMinutes % 60;
    
    const startTime = `${formData.date.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    const endTime = `${formData.date.toISOString().split('T')[0]}T${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
    
    // Online odayı her zaman ekle
    const onlineRoom = rooms.find(room => room.id === 'online');
    let availableRooms = onlineRoom ? [onlineRoom] : [];
    
    // Fiziksel odalar için uygunluk kontrolü yap
    const physicalRooms = rooms.filter(room => room.id !== 'online');
    
    for (const room of physicalRooms) {
      let isAvailable = true;
      
      // Bu oda için çakışan randevular var mı?
      for (const appointment of existingAppointments) {
        if (appointment.room_id === room.id) {
          const apptStartTime = new Date(appointment.start_time).getTime();
          const apptEndTime = new Date(appointment.end_time).getTime();
          const newStartTime = new Date(startTime).getTime();
          const newEndTime = new Date(endTime).getTime();
          
          // Çakışma kontrolü
          if (
            (newStartTime >= apptStartTime && newStartTime < apptEndTime) || // Başlangıç zamanı çakışıyor
            (newEndTime > apptStartTime && newEndTime <= apptEndTime) || // Bitiş zamanı çakışıyor
            (newStartTime <= apptStartTime && newEndTime >= apptEndTime) // İçine alıyor
          ) {
            isAvailable = false;
            break;
          }
        }
      }
      
      if (isAvailable) {
        availableRooms.push(room);
      }
    }
    
    setAvailableRooms(availableRooms);
    return availableRooms;
  };

  // Input değişikliklerini işle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    
    // Randevu süresi değiştiğinde, mevcut saatleri yeniden hesaplatır
    if (name === 'duration' && formData.date) {
      calculateAvailableTimeSlots(formData.date);
    }
  };

  // Tarih değişikliklerini işle
  const handleDateChange = (date: Date) => {
    setSelectedDate(dayjs(date));
    setFormData(prev => ({ ...prev, date, time: '' })); // Tarih değiştiğinde saati sıfırla
  };

  // Saat değişikliklerini işle
  const handleTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  // Oda değişikliklerini işle
  const handleRoomChange = (roomId: string) => {
    setFormData(prev => ({ ...prev, roomId }));
  };

  // Form gönderimini işle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.date || !formData.time) {
      setError('Lütfen gerekli tüm alanları doldurun.');
      return;
    }
    
      if (!formData.isOnline && !formData.roomId) {
      setError('Lütfen bir oda seçin veya online görüşme olarak işaretleyin.');
      return;
      }
      
    setLoading(true);
    setError(null);
    
    try {
      // Randevu başlangıç ve bitiş zamanlarını hesapla
      const [hour, minute] = formData.time.split(':').map(Number);
      const durationMinutes = parseInt(formData.duration, 10);
      
      const startTime = new Date(formData.date);
      startTime.setHours(hour, minute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);
      
      // Randevu verisi oluştur
      const appointmentData = {
        client_id: formData.clientId,
        professional_id: formData.professionalId,
        room_id: formData.isOnline ? 'online' : formData.roomId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'scheduled',
        notes: formData.notes || null,
        is_online: formData.isOnline
      };
      
      // Randevuyu oluştur
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Başarı mesajını göster
      setSuccess('Randevu başarıyla oluşturuldu!');
      
      // Form verilerini sıfırla
      setFormData({
        clientId: '',
        professionalId: professionalId || '',
        roomId: '',
        date: new Date(),
        time: '',
        duration: '45',
        notes: '',
        isOnline: false
      });
      
      // Callback'i çağır
      if (onSuccess) {
      setTimeout(() => {
          onSuccess();
        }, 1500);
        }
      
      // Modal'ı kapat
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Randevu oluşturulurken hata oluştu:', error);
      setError('Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Türkçe gün adını formatla
  const formatTurkishDay = (date: Date) => {
    return format(date, 'EEEE', { locale: tr });
  };

  // Türkçe tarihi formatla
  const formatTurkishDate = (date: Date) => {
    return format(date, 'd MMMM yyyy', { locale: tr });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center overflow-y-auto p-1">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden w-full max-w-3xl mx-auto relative my-1"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              Yeni Randevu Oluştur
            </h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Adım göstergesi */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <motion.div 
                    key={step}
                    className={`flex items-center ${step !== 5 && 'mr-1'}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step * 0.1 }}
                  >
                    <motion.div 
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        step < currentStep 
                          ? 'bg-primary-600 text-white' 
                          : step === currentStep 
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 ring-2 ring-primary-500 dark:ring-primary-400' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                      whileHover={step <= currentStep ? { scale: 1.05 } : {}}
                      whileTap={step <= currentStep ? { scale: 0.95 } : {}}
                      onClick={() => step < currentStep && setCurrentStep(step)}
                    >
                      {step < currentStep ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span>{step}</span>
                      )}
                    </motion.div>
                    {step !== 5 && (
                      <div className={`h-0.5 w-6 ${
                        step < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}></div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {currentStep === 1 && 'Danışan Seçimi'}
                {currentStep === 2 && 'Tarih Seçimi'}
                {currentStep === 3 && 'Saat Seçimi'}
                {currentStep === 4 && 'Görüşme Yeri'}
                {currentStep === 5 && 'Randevu Özeti'}
              </div>
            </div>
          </div>

          {/* Form içeriği */}
          <div className="p-4 overflow-y-auto relative" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {loading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 z-10 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 shadow-lg animate-pulse">
                    <Loader2 size={20} className="animate-spin text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">İşleminiz gerçekleştiriliyor...</p>
                </div>
                </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-start"
              >
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 bg-green-500 dark:bg-green-600 rounded-lg shadow-lg text-white flex items-center z-50"
              >
                <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
                <p className="text-xs font-medium">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Form içeriği burada - her bir adım ayrı render ediliyor */}
              {/* Adım 1: Danışan Seçimi */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Randevu oluşturmak için danışan seçin</h4>
                    
                    {stepLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 size={24} className="animate-spin text-primary-600 dark:text-primary-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Danışan listesi yükleniyor...</p>
                          </div>
                      </div>
                    ) : (
                      <>
                        {/* Danışan arama */}
                        <div className="mb-4 relative" ref={searchRef}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Danışan Ara
                        </label>
                        <div className="relative">
                            <input
                              type="text"
                              placeholder="Ad soyad ile ara..."
                              value={searchTerm}
                              onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (formData.clientId && e.target.value !== selectedClient?.full_name) {
                                  setFormData(prev => ({ ...prev, clientId: '' }));
                                }
                                setDropdownOpen(true);
                              }}
                              onFocus={() => setDropdownOpen(true)}
                              className="appearance-none block w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition-shadow"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            {selectedClient && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, clientId: '' }));
                                  setSearchTerm('');
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          
                          {/* Danışan listesi dropdown */}
                          {dropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {clients.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                  Henüz danışan eklenmemiş
                                </div>
                              ) : filteredClients.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                  Eşleşen danışan bulunamadı
                                </div>
                              ) : (
                                filteredClients.map(client => (
                                  <div
                                    key={client.id}
                                    onClick={() => {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        clientId: client.id,
                                        professionalId: client.professional_id || formData.professionalId
                                      }));
                                      setSearchTerm(client.full_name);
                                      setDropdownOpen(false);
                                    }}
                                    className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                      formData.clientId === client.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
                                        <User size={16} />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{client.full_name}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                          {client.phone && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{client.phone}</p>
                                          )}
                                          {client.email && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                  </div>
                        
                        {/* Seçilen danışan bilgisi */}
                        {selectedClient && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 border border-primary-100 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
                                <User size={18} />
              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">{selectedClient.full_name}</h5>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  {selectedClient.phone && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{selectedClient.phone}</p>
                                  )}
                                  {selectedClient.email && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{selectedClient.email}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Randevu süresi seçimi */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Randevu Süresi
                        </label>
                        <div className="relative">
                          <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition-shadow"
                          >
                            <option value="30">30 dakika</option>
                            <option value="45">45 dakika</option>
                              <option value="60">60 dakika (1 saat)</option>
                              <option value="90">90 dakika (1.5 saat)</option>
                              <option value="120">120 dakika (2 saat)</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                      </div>
                      </div>
                        
                        {/* Bilgilendirme */}
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Devam etmek için lütfen bir danışan seçin. Danışan seçimi yapıldıktan sonra tarih seçimine geçebilirsiniz.
                              </p>
                </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Adım 2: Tarih Seçimi */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Randevu tarihini seçin</h4>
                    
                    {/* Seçili danışan bilgisi */}
                    {selectedClient && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
                            <User size={16} />
                          </div>
              <div>
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">{selectedClient.full_name}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Randevu Süresi: {formData.duration} dakika</p>
                  </div>
                        </div>
                      </div>
                    )}
                        
                    {stepLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 size={24} className="animate-spin text-primary-600 dark:text-primary-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Uygun tarihler yükleniyor...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Tarih seçimi */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <ThemeProvider theme={theme}>
                              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                                <DateCalendar 
                                  value={selectedDate}
                                  onChange={(newDate) => {
                                    if (newDate) {
                                      handleDateChange(newDate.toDate());
                                    }
                                  }}
                                  disablePast
                                  sx={{
                                    width: '100%',
                                    maxWidth: '100%',
                                    bgcolor: theme => theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
                                    color: theme => theme.palette.mode === 'dark' ? '#f8fafc' : '#334155',
                                    borderRadius: 1,
                                    '& .MuiPickersDay-root.Mui-selected': {
                                      backgroundColor: '#4f46e5',
                                      color: '#fff',
                                    },
                                    '& .MuiPickersDay-root:hover': {
                                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                    }
                                  }}
                                  shouldDisableDate={(date) => !isClinicOpen(date.toDate())}
                                />
                              </LocalizationProvider>
                            </ThemeProvider>
                          </div>
                        
                        {/* Seçilen tarih bilgisi */}
                        {formData.date && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 border border-primary-100 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
                                <Calendar size={16} />
                        </div>
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  {formatTurkishDay(formData.date)}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {formatTurkishDate(formData.date)}
                                </p>
                      </div>
                  </div>
                          </motion.div>
                        )}
                        
                        {/* Bilgilendirme */}
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Kırmızı ile işaretlenen tarihler klinik veya uzmanın çalışma takviminde kapalı/izinli olduğu günlerdir.
                              </p>
            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Adım 3: Saat Seçimi */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Randevu saatini seçin</h4>
                    
                    {/* Özet bilgiler */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-2">
                            <User size={14} />
                          </div>
                <div>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedClient?.full_name}</p>
                    </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-2">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatTurkishDay(formData.date)}, {formatTurkishDate(formData.date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-2">
                            <Clock size={14} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">Randevu Süresi: {formData.duration} dakika</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {stepLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 size={24} className="animate-spin text-primary-600 dark:text-primary-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Uygun saatler hesaplanıyor...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Saat seçimi */}
                        <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Müsait Saatler
                    </label>
                      
                    {availableTimeSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {availableTimeSlots.map(time => (
                            <motion.button
                            key={time}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTimeChange(time)}
                                  className={`py-2 px-3 rounded-lg text-center transition-all duration-200 ${
                                formData.time === time
                                  ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                                  : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                              }`}
                          >
                            {time}
                            </motion.button>
                        ))}
                      </div>
                    ) : (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg">
                              <div className="flex items-center">
                                <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-2 flex-shrink-0">
                                  <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                        </div>
                                <p className="ml-3 text-sm text-amber-800 dark:text-amber-400">
                                  Seçilen tarihte uygun randevu saati bulunamadı. Lütfen başka bir tarih seçin.
                            </p>
                          </div>
                      </div>
                    )}
                        </div>
                      
                        {/* Seçilen saat bilgisi */}
                      {formData.time && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-3 border border-primary-100 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
                                <Clock size={16} />
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                  Seçilen saat: {formData.time}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Randevu bitiş saati: {(() => {
                                    const [hour, minute] = formData.time.split(':').map(Number);
                                    const durationMinutes = parseInt(formData.duration, 10);
                                    
                                    const endTimeInMinutes = hour * 60 + minute + durationMinutes;
                                    const endHour = Math.floor(endTimeInMinutes / 60);
                                    const endMinute = endTimeInMinutes % 60;
                                    
                                    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
                                  })()}
                            </p>
                  </div>
                </div>
                          </motion.div>
                        )}
                        
                        {/* Bilgilendirme */}
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Devam etmek için lütfen bir saat seçin. Saat seçimi yapıldıktan sonra görüşme yeri seçimine geçebilirsiniz.
                              </p>
                  </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Adım 4: Görüşme Yeri */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Görüşme türü ve yeri seçin</h4>
                    
                    {/* Özet bilgiler */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-2">
                            <User size={14} />
                          </div>
                <div>
                            <p className="text-sm text-gray-900 dark:text-white">{selectedClient?.full_name}</p>
                    </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-2">
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatTurkishDay(formData.date)}, {formatTurkishDate(formData.date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-2">
                            <Clock size={14} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">Saat: {formData.time} ({formData.duration} dk)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {stepLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 size={24} className="animate-spin text-primary-600 dark:text-primary-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Görüşme seçenekleri hazırlanıyor...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Görüşme Türü Seçimi */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Görüşme Türü
                        </label>
                          <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setFormData(prev => ({ ...prev, isOnline: false, roomId: '' }))}
                              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                                !formData.isOnline
                              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                              <div className={`p-2 rounded-full mr-2 ${
                                !formData.isOnline
                              ? 'bg-white/20'
                              : 'bg-primary-100 dark:bg-primary-900/30'
                          }`}>
                                <Home size={16} className={!formData.isOnline ? 'text-white' : 'text-primary-600 dark:text-primary-400'} />
                  </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">Yüz Yüze Görüşme</p>
                                <p className="text-xs opacity-80">Klinikte buluşma</p>
                              </div>
                          </motion.button>
                          
                          <motion.button
                            type="button"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setFormData(prev => ({ ...prev, isOnline: true, roomId: 'online' }))}
                              className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                                formData.isOnline
                                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                              <div className={`p-2 rounded-full mr-2 ${
                                formData.isOnline
                                ? 'bg-white/20'
                                : 'bg-primary-100 dark:bg-primary-900/30'
                            }`}>
                                <Video size={16} className={formData.isOnline ? 'text-white' : 'text-primary-600 dark:text-primary-400'} />
                          </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">Online Görüşme</p>
                                <p className="text-xs opacity-80">Video konferans</p>
                              </div>
                        </motion.button>
                        </div>
                      </div>
                      
                        {/* Oda Seçimi (Yüz yüze görüşme seçilirse) */}
                        {!formData.isOnline && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Oda Seçimi
                          </label>
                          
                            {availableRooms
                              .filter(room => room.id !== 'online')
                              .length === 0 ? (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg">
                                  <div className="flex items-center">
                                    <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-2 flex-shrink-0">
                                      <Home size={16} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                    <p className="ml-3 text-sm text-amber-800 dark:text-amber-400">
                                      Bu saatte müsait oda bulunamadı. Lütfen başka bir saat seçin veya online görüşme olarak planlayın.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                  {availableRooms
                          .filter(room => room.id !== 'online')
                                    .map(room => (
                              <motion.button
                            key={room.id}
                                type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleRoomChange(room.id)}
                                        className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                                  formData.roomId === room.id
                                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                                            : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                        <div className={`p-2 rounded-full mr-2 ${
                                  formData.roomId === room.id
                                    ? 'bg-white/20'
                                            : 'bg-primary-100 dark:bg-primary-900/30'
                                }`}>
                                          <Home size={16} className={
                                    formData.roomId === room.id
                                      ? 'text-white'
                                              : 'text-primary-600 dark:text-primary-400'
                                  } />
                      </div>
                                <div className="flex-1 text-left">
                                          <p className="font-medium text-sm">{room.name}</p>
                                          <p className="text-xs opacity-80">Müsait</p>
                        </div>
                              </motion.button>
                                    ))}
                </div>
              )}
                    </div>
                        )}
                        
                        {/* Notes (Opsiyonel) */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Randevu Notları (Opsiyonel)
                    </label>
                        <div className="relative">
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition-shadow text-sm"
                              placeholder="Randevu ile ilgili ekstra bilgiler veya notlar..."
                          ></textarea>
                            <PencilLine size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                        
                        {/* Bilgilendirme */}
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <AlertCircle size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {formData.isOnline
                                  ? "Online görüşme seçildi. Devam etmek için 'Sonraki Adım' butonuna tıklayın."
                                  : "Yüz yüze görüşme için lütfen bir oda seçin. Oda seçimi yapıldıktan sonra devam edebilirsiniz."}
                              </p>
              </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Adım 5: Randevu Özeti */}
              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Randevu Özeti</h4>
                    
                    {/* Özet bilgiler */}
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/10 dark:to-indigo-900/10 rounded-lg border border-primary-100 dark:border-primary-800/30 relative overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-pattern-dots opacity-5 pointer-events-none"></div>
                  
                      <div className="relative z-10">
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                          Yeni Randevu
                        </h5>
                        
                        <div className="space-y-3">
                          <div className="flex items-start p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm backdrop-blur-sm">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-3 flex-shrink-0">
                              <User size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">Danışan</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedClient?.full_name}</p>
                            </div>
                    </div>
                    
                          <div className="flex items-start p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm backdrop-blur-sm">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-3 flex-shrink-0">
                              <Users size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">Uzman</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {professionals.find(p => p.id === formData.professionalId)?.full_name || 'Atanmış uzman yok'}
                              </p>
                            </div>
                  </div>
                    
                          <div className="flex items-start p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm backdrop-blur-sm">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-3 flex-shrink-0">
                              <Calendar size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">Tarih ve Saat</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {formatTurkishDay(formData.date)}, {formatTurkishDate(formData.date)} • {formData.time}
                              </p>
                            </div>
            </div>
                    
                          <div className="flex items-start p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm backdrop-blur-sm">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-3 flex-shrink-0">
                              <Clock size={16} className="text-primary-600 dark:text-primary-400" />
                      </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">Süre</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{formData.duration} dakika</p>
                            </div>
          </div>

                          <div className="flex items-start p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm backdrop-blur-sm">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-3 flex-shrink-0">
                              {formData.isOnline ? (
                                <Video size={16} className="text-primary-600 dark:text-primary-400" />
                              ) : (
                                <Home size={16} className="text-primary-600 dark:text-primary-400" />
                              )}
                      </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">Görüşme Türü</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {formData.isOnline 
                            ? 'Online Görüşme'
                                  : `Yüz Yüze - ${rooms.find(r => r.id === formData.roomId)?.name || 'Oda seçilmedi'}`
                        }
                      </p>
                    </div>
                  </div>

                          {formData.notes && (
                            <div className="flex items-start p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-sm backdrop-blur-sm">
                              <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-3 flex-shrink-0">
                                <PencilLine size={16} className="text-primary-600 dark:text-primary-400" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">Notlar</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{formData.notes}</p>
                              </div>
                            </div>
              )}
                </div>
              </div>
                    </div>
                    
                    {/* Onay bilgilendirmesi */}
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Randevu bilgilerinizi kontrol ettikten sonra "Randevuyu Oluştur" butonuna tıklayarak işlemi tamamlayabilirsiniz.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm">
            {/* Önceki adım butonu */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              onClick={goToPrevStep}
              disabled={currentStep === 1 || loading || stepLoading}
              className={`px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                currentStep === 1 ? 'invisible' : ''
              }`}
            >
              <ArrowLeft size={16} className="mr-1" />
              Önceki Adım
              </motion.button>
              
            {/* Sonraki adım veya tamamla butonu */}
            {currentStep < 5 ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={goToNextStep}
                disabled={!isStepValid(currentStep) || loading || stepLoading}
                className="px-3 py-2 rounded-md bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-sm font-medium transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-indigo-600 flex items-center"
              >
                {stepLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    Sonraki Adım
                    <ArrowRight size={16} className="ml-1" />
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleSubmit}
                disabled={loading || stepLoading}
                className="px-3 py-2 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    İşleniyor...
                  </>
                ) : (
                  <>
                    Randevuyu Oluştur
                    <CheckCircle2 size={16} className="ml-1" />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
