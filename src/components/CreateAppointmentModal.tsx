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
  Search
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

  // Sayfa yüklendiğinde veya modalın açılmasıyla verileri yükle
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, professionalId, assistantId]);

  // Client veya Professional değiştiğinde verileri güncelle
  useEffect(() => {
    if (formData.clientId && formData.date) {
      loadAppointmentsForDate(format(formData.date, 'yyyy-MM-dd'));
      calculateAvailableTimeSlots(formData.date);
    }
  }, [formData.clientId, formData.date, formData.duration]);

  // Zaman dilimi seçildiğinde uygun odaları hesapla
  useEffect(() => {
    if (formData.date && formData.time) {
      const availableRooms = calculateAvailableRooms();
      setAvailableRooms(availableRooms);
      
      // Eğer seçili oda artık uygun değilse, odayı temizle
      if (formData.roomId && !availableRooms.some(room => room.id === formData.roomId)) {
        setFormData(prev => ({ ...prev, roomId: '' }));
      }
    }
  }, [formData.date, formData.time, existingAppointments]);

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

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Sadece başlangıçta gereken temel verileri yükle
      try {
        // Danışan verileri
        await loadClients();
      } catch (error) {
        console.error('Danışan verileri yüklenirken hata:', error);
      }
      
      // Professional ID varsa, sadece o uzmanla ilgili temel verileri yükle
      if (professionalId) {
        setFormData(prev => ({ ...prev, professionalId }));
      } 
      // Assistant ID varsa, o asistana bağlı tüm uzmanları yükle
      else if (assistantId) {
        try {
          await loadProfessionals();
        } catch (error) {
          console.error('Uzman verileri yüklenirken hata:', error);
        }
      }
    } catch (error) {
      console.error('Başlangıç verileri yüklenirken hata oluştu:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Danışan seçimi yapıldığında ilgili verileri yükle
  useEffect(() => {
    if (formData.clientId) {
      loadUserSpecificData();
    }
  }, [formData.clientId]);

  // Tarih seçildiğinde ilgili verileri yükle
  useEffect(() => {
    if (formData.date) {
      loadDateSpecificData();
    }
  }, [formData.date]);

  // Saat seçildiğinde ilgili verileri yükle
  useEffect(() => {
    if (formData.date && formData.time) {
      loadTimeSpecificData();
    }
  }, [formData.time]);

  // Saat seçildiğinde ilgili verileri yükle
  const loadTimeSpecificData = async () => {
    // Odaları yükle (eğer daha önce yüklenmemişse)
    if (rooms.length <= 1) { // Sadece online oda varsa veya hiç yoksa
      try {
        await loadRooms();
      } catch (error) {
        console.error('Oda verileri yüklenirken hata:', error);
      }
    }
  };

  // Danışan seçildiğinde ilgili verileri yükle
  const loadUserSpecificData = async () => {
    // Danışan seçildiğinde odaları yükle
    try {
      await loadRooms();
    } catch (error) {
      console.error('Oda verileri yüklenirken hata:', error);
    }

    // Profesyonel ID'yi danışandan belirle (eğer manuel ayarlanmadıysa)
    if (!professionalId && formData.clientId) {
      const selectedClient = clients.find(client => client.id === formData.clientId);
      if (selectedClient) {
        setFormData(prev => ({ ...prev, professionalId: selectedClient.professional_id }));
        
        try {
          await loadProfessionalWorkingHours(selectedClient.professional_id);
        } catch (error) {
          console.error('Uzman çalışma saatleri yüklenirken hata:', error);
        }
      }
    }
  };

  // Tarih seçildiğinde ilgili verileri yükle
  const loadDateSpecificData = async () => {
      try {
        await loadClinicHours();
      } catch (error) {
        console.error('Klinik çalışma saatleri yüklenirken hata:', error);
      }
      
      try {
        await loadClinicBreaks();
      } catch (error) {
        console.error('Klinik mola saatleri yüklenirken hata:', error);
      }
      
      try {
        await loadClinicVacations();
      } catch (error) {
        console.error('Klinik tatil verileri yüklenirken hata:', error);
      }
      
    if (formData.professionalId) {
      try {
        await loadProfessionalBreaks(formData.professionalId);
        } catch (error) {
          console.error('Uzman mola verileri yüklenirken hata:', error);
        }
        
        try {
        await loadProfessionalVacations(formData.professionalId);
        } catch (error) {
          console.error('Uzman tatil verileri yüklenirken hata:', error);
        }
      } 

    // Tarih için mevcut randevuları yükle
    if (formData.date) {
      await loadAppointmentsForDate(format(formData.date, 'yyyy-MM-dd'));
    }
  };

  const loadClients = async () => {
    try {
      let query = supabase.from('clients').select('*').order('full_name');
      
      // Eğer professional ID varsa, sadece o profesyonelin danışanlarını yükle
      if (professionalId) {
        query = query.eq('professional_id', professionalId);
      } 
      // Eğer assistant ID varsa, o asistana bağlı tüm uzmanların danışanlarını yükle
      else if (assistantId) {
        const { data: professionalIds } = await supabase
          .from('professionals')
          .select('id')
          .eq('assistant_id', assistantId);
          
        if (professionalIds && professionalIds.length > 0) {
          query = query.in('professional_id', professionalIds.map(p => p.id));
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Danışan verileri yüklenirken hata:', error);
      throw error;
    }
  };

  const loadProfessionals = async () => {
    try {
      if (!assistantId) return;
      
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('assistant_id', assistantId)
        .order('full_name');
        
      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Uzman verileri yüklenirken hata:', error);
        throw error;
      }
  };

  const loadRooms = async () => {
    try {
      let query = supabase.from('rooms').select('*').order('name');
      
      if (assistantId) {
        query = query.eq('assistant_id', assistantId);
      } else if (professionalId) {
        const { data: professional } = await supabase
          .from('professionals')
          .select('assistant_id')
          .eq('id', professionalId)
          .single();
          
        if (professional?.assistant_id) {
          query = query.eq('assistant_id', professional.assistant_id);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Online görüşme seçeneğini ekle
      const roomsWithOnline = [
        {
          id: 'online',
          name: 'Online Görüşme',
          assistant_id: assistantId || ''
        },
        ...(data || [])
      ];
      
      setRooms(roomsWithOnline);
    } catch (error) {
      console.error('Oda verileri yüklenirken hata:', error);
      // Hata durumunda en azından online görüşme seçeneğini ekle
      setRooms([{
        id: 'online',
        name: 'Online Görüşme',
        assistant_id: assistantId || ''
      }]);
    }
  };

  const loadClinicHours = async () => {
    try {
      let clinicId = assistantId;
      
      if (!clinicId && professionalId) {
        const { data: professional } = await supabase
          .from('professionals')
          .select('assistant_id')
          .eq('id', professionalId)
          .single();

        clinicId = professional?.assistant_id;
      }
      
      // Klinik ID bulunamadığında varsayılan değerler kullan
      if (!clinicId) {
        setClinicHours({
          pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
          sali: { opening: '09:00', closing: '18:00', isOpen: true },
          carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
          persembe: { opening: '09:00', closing: '18:00', isOpen: true },
          cuma: { opening: '09:00', closing: '18:00', isOpen: true },
          cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
          pazar: { opening: '09:00', closing: '18:00', isOpen: false }
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('assistant_id', clinicId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setClinicHours({
          pazartesi: {
            opening: data.opening_time_monday || '09:00',
            closing: data.closing_time_monday || '18:00',
            isOpen: data.is_open_monday ?? true
          },
          sali: {
            opening: data.opening_time_tuesday || '09:00',
            closing: data.closing_time_tuesday || '18:00',
            isOpen: data.is_open_tuesday ?? true
          },
          carsamba: {
            opening: data.opening_time_wednesday || '09:00',
            closing: data.closing_time_wednesday || '18:00',
            isOpen: data.is_open_wednesday ?? true
          },
          persembe: {
            opening: data.opening_time_thursday || '09:00',
            closing: data.closing_time_thursday || '18:00',
            isOpen: data.is_open_thursday ?? true
          },
          cuma: {
            opening: data.opening_time_friday || '09:00',
            closing: data.closing_time_friday || '18:00',
            isOpen: data.is_open_friday ?? true
          },
          cumartesi: {
            opening: data.opening_time_saturday || '09:00',
            closing: data.closing_time_saturday || '18:00',
            isOpen: data.is_open_saturday ?? false
          },
          pazar: {
            opening: data.opening_time_sunday || '09:00',
            closing: data.closing_time_sunday || '18:00',
            isOpen: data.is_open_sunday ?? false
          }
        });
      } else {
        setClinicHours({
          pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
          sali: { opening: '09:00', closing: '18:00', isOpen: true },
          carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
          persembe: { opening: '09:00', closing: '18:00', isOpen: true },
          cuma: { opening: '09:00', closing: '18:00', isOpen: true },
          cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
          pazar: { opening: '09:00', closing: '18:00', isOpen: false }
        });
      }
    } catch (error) {
      console.error('Klinik çalışma saatleri yüklenirken hata:', error);
      // Hata durumunda varsayılan değerler belirle
      setClinicHours({
        pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
        sali: { opening: '09:00', closing: '18:00', isOpen: true },
        carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
        persembe: { opening: '09:00', closing: '18:00', isOpen: true },
        cuma: { opening: '09:00', closing: '18:00', isOpen: true },
        cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
        pazar: { opening: '09:00', closing: '18:00', isOpen: false }
      });
    }
  };

  const loadProfessionalWorkingHours = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from('professional_working_hours')
        .select('*')
        .eq('professional_id', profId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfessionalWorkingHours({
          pazartesi: {
            opening: data.opening_time_monday || '09:00',
            closing: data.closing_time_monday || '18:00',
            isOpen: data.is_open_monday ?? true
          },
          sali: {
            opening: data.opening_time_tuesday || '09:00',
            closing: data.closing_time_tuesday || '18:00',
            isOpen: data.is_open_tuesday ?? true
          },
          carsamba: {
            opening: data.opening_time_wednesday || '09:00',
            closing: data.closing_time_wednesday || '18:00',
            isOpen: data.is_open_wednesday ?? true
          },
          persembe: {
            opening: data.opening_time_thursday || '09:00',
            closing: data.closing_time_thursday || '18:00',
            isOpen: data.is_open_thursday ?? true
          },
          cuma: {
            opening: data.opening_time_friday || '09:00',
            closing: data.closing_time_friday || '18:00',
            isOpen: data.is_open_friday ?? true
          },
          cumartesi: {
            opening: data.opening_time_saturday || '09:00',
            closing: data.closing_time_saturday || '18:00',
            isOpen: data.is_open_saturday ?? false
          },
          pazar: {
            opening: data.opening_time_sunday || '09:00',
            closing: data.closing_time_sunday || '18:00',
            isOpen: data.is_open_sunday ?? false
          }
        });
      } else {
        setProfessionalWorkingHours({
          pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
          sali: { opening: '09:00', closing: '18:00', isOpen: true },
          carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
          persembe: { opening: '09:00', closing: '18:00', isOpen: true },
          cuma: { opening: '09:00', closing: '18:00', isOpen: true },
          cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
          pazar: { opening: '09:00', closing: '18:00', isOpen: false }
        });
      }
    } catch (error) {
      console.error('Uzman çalışma saatleri yüklenirken hata:', error);
      // Hata durumunda varsayılan değerler kullan
      setProfessionalWorkingHours({
        pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
        sali: { opening: '09:00', closing: '18:00', isOpen: true },
        carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
        persembe: { opening: '09:00', closing: '18:00', isOpen: true },
        cuma: { opening: '09:00', closing: '18:00', isOpen: true },
        cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
        pazar: { opening: '09:00', closing: '18:00', isOpen: false }
      });
    }
  };

  const loadProfessionalBreaks = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from('professional_breaks')
        .select('*')
        .eq('professional_id', profId);
        
      if (error) throw error;
      setProfessionalBreaks(data || []);
    } catch (error) {
      console.error('Uzman mola saatleri yüklenirken hata:', error);
      // Hata durumunda boş dizi ayarla
      setProfessionalBreaks([]);
    }
  };

  const loadClinicBreaks = async () => {
    try {
      let clinicId = assistantId;
      
      if (!clinicId && professionalId) {
        const { data: professional } = await supabase
          .from('professionals')
          .select('assistant_id')
          .eq('id', professionalId)
          .single();

        clinicId = professional?.assistant_id;
      }
      
      // Klinik ID bulunamadığında boş dizi kullan
      if (!clinicId) {
        setClinicBreaks([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('clinic_breaks')
        .select('*')
        .eq('clinic_id', clinicId);
        
      if (error) throw error;
      setClinicBreaks(data || []);
    } catch (error) {
      console.error('Klinik mola saatleri yüklenirken hata:', error);
      // Hata durumunda boş dizi ayarla
      setClinicBreaks([]);
    }
  };

  const loadProfessionalVacations = async (profId: string) => {
    try {
      const { data, error } = await supabase
        .from('vacations')
        .select('*')
        .eq('professional_id', profId);

      if (error) throw error;
      setProfessionalVacations(data || []);
    } catch (error) {
      console.error('Uzman izinleri yüklenirken hata:', error);
      // Hata durumunda boş dizi ayarla
      setProfessionalVacations([]);
    }
  };

  const loadClinicVacations = async () => {
    try {
      let clinicId = assistantId;

      if (!clinicId && professionalId) {
        const { data: professional } = await supabase
          .from('professionals')
          .select('assistant_id')
          .eq('id', professionalId)
          .single();

        clinicId = professional?.assistant_id;
      }
      
      // Klinik ID bulunamadığında boş dizi kullan
      if (!clinicId) {
        setClinicVacations([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('vacations')
        .select('*')
        .eq('clinic_id', clinicId);

      if (error) throw error;
      setClinicVacations(data || []);
    } catch (error) {
      console.error('Klinik izinleri yüklenirken hata:', error);
      // Hata durumunda boş dizi ayarla
      setClinicVacations([]);
    }
  };

  const loadAppointmentsForDate = async (date: string) => {
    try {
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(23, 59, 59, 999);

      let query = supabase
        .from('appointments')
        .select('*')
        .eq('status', 'scheduled');

      // Sadece ilgili uzmanın randevuları ile sınırlandır
      if (formData.professionalId) {
        query = query.eq('professional_id', formData.professionalId);
      } else if (assistantId) {
        const { data: managedProfessionals } = await supabase
          .from('professionals')
          .select('id')
          .eq('assistant_id', assistantId);

        if (managedProfessionals && managedProfessionals.length > 0) {
          const professionalIds = managedProfessionals.map((p) => p.id);
          query = query.in('professional_id', professionalIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      setExistingAppointments(data || []);
    } catch (error) {
      console.error('Mevcut randevular yüklenirken hata:', error);
      // Hata durumunda boş dizi ayarla
      setExistingAppointments([]);
    }
  };

  // Tarih, tatil ve mesai saati kontrolleri
  const isDateInVacations = (date: Date): boolean => {
    if (!professionalVacations || !clinicVacations) {
      return false;
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Profesyonel tatili kontrolü
    const isProfessionalOnVacation = professionalVacations.some(vacation => {
      const startDate = vacation.start_date.substring(0, 10);
      const endDate = vacation.end_date.substring(0, 10);
      return dateStr >= startDate && dateStr <= endDate;
    });
    
    // Klinik tatili kontrolü
    const isClinicOnVacation = clinicVacations.some(vacation => {
      const startDate = vacation.start_date.substring(0, 10);
      const endDate = vacation.end_date.substring(0, 10);
      return dateStr >= startDate && dateStr <= endDate;
    });
    
    return isProfessionalOnVacation || isClinicOnVacation;
  };

  const isClinicOpen = (date: Date): boolean => {
    // Eğer clinicHours yüklenmemişse, açık olarak kabul et
    if (!clinicHours) {
      return true;
    }
    
    // Tatil günü kontrolü
    if (isDateInVacations(date)) {
      return false;
    }
    
    const dayOfWeek = date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    
    // Klinik çalışma saatleri kontrolü
    const isClinicWorkDay = clinicHours[currentDay]?.isOpen || false;
    
    // Profesyonel çalışma saatleri kontrolü (eğer seçilmişse)
    const isProfessionalWorkDay = formData.professionalId && professionalWorkingHours
      ? professionalWorkingHours[currentDay]?.isOpen || false
      : true;
    
    return isClinicWorkDay && isProfessionalWorkDay;
  };

  const isTimeInBreaks = (hour: number, minute: number): boolean => {
    const timeToCheck = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const dayOfWeek = formData.date.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const englishDay = days[dayOfWeek];
    
    // Profesyonel molaları kontrolü
    const isInProfessionalBreak = professionalBreaks.some(breakItem => {
      if (breakItem.day_of_week.toLowerCase() !== englishDay) return false;
      
      return timeToCheck >= breakItem.start_time && timeToCheck < breakItem.end_time;
    });
    
    // Klinik molaları kontrolü
    const isInClinicBreak = clinicBreaks.some(breakItem => {
      if (breakItem.day_of_week.toLowerCase() !== englishDay) return false;
      
      return timeToCheck >= breakItem.start_time && timeToCheck < breakItem.end_time;
    });
    
    return isInProfessionalBreak || isInClinicBreak;
  };

  // Zaman dilimleri ve oda hesaplama işlevleri
  const calculateAvailableTimeSlots = (date: Date) => {
    if (!date || !clinicHours) {
      setAvailableTimeSlots([]);
      return [];
    }

    // Tatil veya mesai dışı kontrolü
    if (!isClinicOpen(date)) {
      setAvailableTimeSlots([]);
      return [];
    }
    
    const dayOfWeek = date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    
    const clinicDayHours = clinicHours[currentDay];
    const professionalDayHours = professionalWorkingHours?.[currentDay];

    if (!clinicDayHours.isOpen || (professionalDayHours && !professionalDayHours.isOpen)) {
      setAvailableTimeSlots([]);
      return [];
    }

    // Çalışma saatlerinin kesişimini al
    let openingHour = parseInt(clinicDayHours.opening.split(':')[0]);
    let openingMinute = parseInt(clinicDayHours.opening.split(':')[1]);
    let closingHour = parseInt(clinicDayHours.closing.split(':')[0]);
    let closingMinute = parseInt(clinicDayHours.closing.split(':')[1]);
    
    if (professionalDayHours) {
      const profOpeningHour = parseInt(professionalDayHours.opening.split(':')[0]);
      const profOpeningMinute = parseInt(professionalDayHours.opening.split(':')[1]);
      const profClosingHour = parseInt(professionalDayHours.closing.split(':')[0]);
      const profClosingMinute = parseInt(professionalDayHours.closing.split(':')[1]);
      
      // En geç başlangıç saatini al
      if (profOpeningHour > openingHour || (profOpeningHour === openingHour && profOpeningMinute > openingMinute)) {
        openingHour = profOpeningHour;
        openingMinute = profOpeningMinute;
      }
      
      // En erken bitiş saatini al
      if (profClosingHour < closingHour || (profClosingHour === closingHour && profClosingMinute < closingMinute)) {
        closingHour = profClosingHour;
        closingMinute = profClosingMinute;
      }
    }
    
    const slots: string[] = [];
    let currentHour = openingHour;
    let currentMinute = openingMinute;
    
    // Mevcut zamanı kontrol et
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();
    
    // Uzmanın mevcut tüm randevularını al (sadece seçilen tarihteki değil, tüm randevular)
    const professionalAppointments = formData.professionalId 
      ? existingAppointments.filter(app => app.professional_id === formData.professionalId)
      : [];
    
    while (
      currentHour < closingHour || 
      (currentHour === closingHour && currentMinute <= closingMinute - parseInt(formData.duration))
    ) {
      // Bugün ise ve zaman geçmişte kaldıysa atla
      if (isToday) {
        const slotTime = new Date(date);
        slotTime.setHours(currentHour, currentMinute, 0, 0);
        
        if (slotTime < now) {
          currentMinute += 15;
          if (currentMinute >= 60) {
      currentHour += 1;
            currentMinute = 0;
          }
          continue;
        }
      }
      
      // Mola zamanlarında ise atla
      if (isTimeInBreaks(currentHour, currentMinute)) {
        currentMinute += 15;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
        continue;
      }
      
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Randevu süresi için yeterli zaman var mı kontrol et
      const slotStartTime = new Date(date);
      slotStartTime.setHours(currentHour, currentMinute, 0, 0);
      
      const slotEndTime = new Date(slotStartTime.getTime() + parseInt(formData.duration) * 60000);
      const slotEndHour = slotEndTime.getHours();
      const slotEndMinute = slotEndTime.getMinutes();
      
      if (
        slotEndHour > closingHour || 
        (slotEndHour === closingHour && slotEndMinute > closingMinute)
      ) {
        break;
      }
      
      // Uzmanın herhangi bir randevusu ile çakışma kontrolü
      const hasProfessionalConflict = professionalAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.start_time);
        const appointmentEnd = new Date(appointment.end_time);
        
        // Uzmanın başka bir yerdeki randevusu ile çakışma
        const sameDay = appointmentStart.toDateString() === slotStartTime.toDateString();
        if (!sameDay) return false;
        
        return (
          (slotStartTime >= appointmentStart && slotStartTime < appointmentEnd) ||
          (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) ||
          (slotStartTime <= appointmentStart && slotEndTime >= appointmentEnd)
        );
      });
      
      // Eğer uzmanın çakışan bir randevusu varsa, bu zaman dilimini atla
      if (hasProfessionalConflict) {
        currentMinute += 15;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
        continue;
      }
      
      slots.push(timeString);
      
      // Sonraki zaman dilimi
      currentMinute += 15;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    setAvailableTimeSlots(slots);
    return slots;
  };

  const calculateAvailableRooms = () => {
    if (!formData.date || !formData.time || !rooms.length) {
      return [];
    }
    
    const startDateTime = new Date(formData.date);
    const [hours, minutes] = formData.time.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    
    const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);
    
    // Önce online görüşmeleri dahil et
    const availableRoomsList = [{ 
      id: 'online', 
      name: 'Online Görüşme', 
      assistant_id: assistantId || '' 
    }];
    
    // Fiziksel odaları kontrol et
    const physicalRooms = rooms.filter(room => room.id !== 'online');
    
    for (const room of physicalRooms) {
      const hasConflict = existingAppointments.some(appointment => {
        if (appointment.room_id !== room.id) return false;
        
        const appointmentStart = new Date(appointment.start_time);
        const appointmentEnd = new Date(appointment.end_time);
        
        return (
          (startDateTime >= appointmentStart && startDateTime < appointmentEnd) ||
          (endDateTime > appointmentStart && endDateTime <= appointmentEnd) ||
          (startDateTime <= appointmentStart && endDateTime >= appointmentEnd)
        );
      });
      
      if (!hasConflict) {
        availableRoomsList.push(room);
      }
    }
    
    return availableRoomsList;
  };

  // Form işleme ve gönderme
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Özel işlemler
    if (name === 'clientId' && value) {
      // Danışan seçildiğinde profesyoneli otomatik ayarla
      const selectedClient = clients.find(client => client.id === value);
      if (selectedClient && !professionalId) {
        setFormData(prev => ({ ...prev, professionalId: selectedClient.professional_id }));
        loadProfessionalWorkingHours(selectedClient.professional_id);
        loadProfessionalBreaks(selectedClient.professional_id);
        loadProfessionalVacations(selectedClient.professional_id);
      }
    } else if (name === 'duration') {
      // Süre değiştiğinde zaman dilimlerini yeniden hesapla
      calculateAvailableTimeSlots(formData.date);
    }
  };

  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, date, time: '' }));
    // Dayjs state'ini de güncelle
    setSelectedDate(dayjs(date));
    loadAppointmentsForDate(format(date, 'yyyy-MM-dd'));
  };

  const handleTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, time, roomId: '' }));
  };

  const handleRoomChange = (roomId: string) => {
    if (roomId === 'online') {
      setFormData(prev => ({ ...prev, roomId: '', isOnline: true }));
    } else {
      setFormData(prev => ({ ...prev, roomId, isOnline: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Gerekli alanları kontrol et
      if (!formData.clientId) throw new Error('Danışan seçilmedi');
      if (!formData.professionalId) throw new Error('Ruh sağlığı uzmanı belirlenmedi');
      if (!formData.date) throw new Error('Tarih seçilmedi');
      if (!formData.time) throw new Error('Saat seçilmedi');
      
      // Online görüşme ise oda kontrol etme, yüz yüze ise oda seçimi zorunlu
      if (!formData.isOnline && !formData.roomId) {
        throw new Error('Yüz yüze görüşme için oda seçimi zorunludur');
      }
      
      // Randevu başlangıç ve bitiş zamanlarını hesapla
      const startDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);
      
      // Online görüşme için Jitsi linki oluştur
      let meetingUrl = null;
      if (formData.isOnline) {
        // Benzersiz bir oda adı oluştur
        const selectedClient = clients.find(c => c.id === formData.clientId);
        const selectedProfessional = professionals.find(p => p.id === formData.professionalId);
        
        // Format: p[professional_id]-c[client_id]-[date_timestamp]
        const meetingRoomId = `p${formData.professionalId.substring(0, 5)}-c${formData.clientId.substring(0, 5)}-${startDateTime.getTime()}`;
        
        // Jitsi Meet URL'i
        meetingUrl = `https://meet.jit.si/${meetingRoomId}`;
      }
      
      // Randevu oluştur
      const { error } = await supabase.from('appointments').insert({
        client_id: formData.clientId,
        professional_id: formData.professionalId,
        room_id: formData.isOnline ? null : formData.roomId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: formData.notes || null,
        status: 'scheduled',
        is_online: formData.isOnline,
        meeting_url: formData.isOnline ? meetingUrl : null
      });
      
      if (error) throw error;
      
      // Başarı mesajını göster, kısa süre sonra kapat
      setSuccess('Randevu oluşturuldu!');
      
      // Başarı mesajını gösterdikten sonra hızlıca modalı kapat
      setTimeout(() => {
        // onSuccess fonksiyonunun varlığını kontrol et
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        onClose();
      }, 800); // Daha kısa bir süre
      
    } catch (error) {
      console.error('Randevu oluşturulurken hata:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Randevu oluşturulurken bir hata oluştu.');
      }
      setLoading(false); // Hata durumunda loading'i kapat
    }
  };

  // Türkçe günleri formatla
  const formatTurkishDay = (date: Date) => {
    return format(date, 'EEEE', { locale: tr });
  };

  // Türkçe tarihi formatla
  const formatTurkishDate = (date: Date) => {
    return format(date, 'd MMMM yyyy', { locale: tr });
  };

  // Modal açık değilse hiçbir şey render etme
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center overflow-y-auto p-1">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden w-full max-w-[98vw] sm:max-w-[95vw] md:max-w-5xl lg:max-w-6xl mx-auto relative my-1"
        >
          

          {/* Form içeriği */}
          <div className="p-2 overflow-y-auto relative overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 110px)' }}>
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
                className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-start"
              >
                <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs">{error}</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">

                {/* Sol Taraf - Danışan seçimi ve tarih */}
                <div className="space-y-2 md:space-y-3">
                  {/* Danışan Seçimi */}
                        <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <div className="h-4 w-4 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">1</span>
                          </div>
                      Danışan Bilgileri
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Danışan Seçin
                        </label>
                        <div className="relative" ref={searchRef}>
                        <div className="relative">
                            <input
                              type="text"
                              placeholder="Danışan ara..."
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
                          
                          {dropdownOpen && (
                            <div className="absolute z-[80] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-36 overflow-y-auto">
                              {clients.length === 0 ? (
                                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                  Henüz danışan eklenmemiş
                                </div>
                              ) : filteredClients.length === 0 ? (
                                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                  Eşleşen danışan bulunamadı
                                </div>
                              ) : (
                                filteredClients.map(client => (
                                  <div
                                    key={client.id}
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, clientId: client.id }));
                                      setSearchTerm(client.full_name);
                                      setDropdownOpen(false);
                                    }}
                                    className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                      formData.clientId === client.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <div className="p-1 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-1.5">
                                        <User size={12} className="text-primary-600 dark:text-primary-400" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{client.full_name}</p>
                                        <div className="flex flex-wrap items-center gap-1">
                                          {client.phone && (
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{client.phone}</p>
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
              </div>

                      {/* Süre seçimi */}
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                            <option value="60">60 dakika</option>
                            <option value="90">90 dakika</option>
                            <option value="120">120 dakika</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                      </div>
                      </div>
                  </div>
                </div>

              {/* Tarih Seçimi */}
              <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <div className="h-4 w-4 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">2</span>
                  </div>
                      Tarih Seçimi
                    </h3>
                    
                    {/* DatePicker konteyneri */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <div className="flex flex-col items-center justify-center">
                        {/* Seçilen tarihi takvimin üstünde gösteriyoruz */}
                      {formData.date && (
                          <div className="w-full mb-2 p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-100 dark:border-primary-800/50">
                          <p className="text-sm text-primary-700 dark:text-primary-300 text-center">
                            <span className="font-semibold">{formatTurkishDay(formData.date)}</span>, {formatTurkishDate(formData.date)}
                          </p>
                      </div>
                    )}
                        
                        {/* Takvimi küçük boyutlu olarak gösteriyoruz */}
                        <div className="w-full mx-auto">
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
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
                                    padding: '0.25rem',
                                    '& .MuiPickersCalendarHeader-root': {
                                      paddingLeft: '0.25rem',
                                      paddingRight: '0.25rem',
                                    },
                                    '& .MuiDayCalendar-header': {
                                      justifyContent: 'space-around',
                                      paddingLeft: '0.25rem',
                                      paddingRight: '0.25rem',
                                    },
                                    '& .MuiDayCalendar-weekContainer': {
                                      justifyContent: 'space-around',
                                      margin: '0.15rem 0',
                                    },
                                    '& .MuiPickersDay-root': {
                                      margin: '0 0.1rem',
                                      height: '2rem',
                                      width: '2rem',
                                      color: theme => theme.palette.mode === 'dark' ? '#f8fafc' : '#334155',
                                      fontSize: '0.75rem',
                                    },
                                    '& .MuiPickersDay-root.Mui-selected': {
                                      backgroundColor: '#4f46e5',
                                      color: '#fff',
                                    },
                                    '& .MuiPickersDay-root:hover': {
                                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                    },
                                    '& .MuiPickersDay-root.Mui-disabled': {
                                      color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                                    },
                                    '& .MuiPickersCalendarHeader-label': {
                                      color: theme => theme.palette.mode === 'dark' ? '#f8fafc' : '#334155',
                                      fontSize: '0.9rem',
                                    },
                                    '& .MuiSvgIcon-root': {
                                      color: theme => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                                      width: '1.25rem',
                                      height: '1.25rem',
                                    }
                                  }}
                                  shouldDisableDate={(date) => !isClinicOpen(date.toDate())}
                                />
                              </LocalizationProvider>
                            </ThemeProvider>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
            </div>

                {/* Orta Kısım - Saat ve oda seçimi */}
                <div className="space-y-2 md:space-y-3">
              {/* Saat Seçimi */}
                <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <div className="h-4 w-4 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">3</span>
                    </div>
                      Saat Seçimi
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Randevu Saati
                    </label>
                      
                    {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1 max-h-[260px] overflow-y-auto pr-1">
                          {availableTimeSlots.map(time => (
                            <motion.button
                            key={time}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTimeChange(time)}
                              className={`py-2 px-1 rounded-lg text-center transition-all duration-200 text-sm ${
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
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-1.5 flex-shrink-0">
                              <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                        </div>
                            <p className="text-xs text-amber-800 dark:text-amber-400">
                              Seçilen tarihte uygun randevu saati bulunamadı.
                            </p>
                          </div>
                      </div>
                    )}
                      
                      {formData.time && (
                        <div className="mt-2 p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-100 dark:border-primary-800/50">
                          <div className="flex items-center space-x-2">
                            <Clock size={14} className="text-primary-600 dark:text-primary-400" />
                            <p className="text-xs text-primary-700 dark:text-primary-300">
                              Seçilen saat: <span className="font-semibold">{formData.time}</span>
                            </p>
                  </div>
                </div>
              )}
                    </div>
                  </div>

              {/* Oda Seçimi */}
                <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <div className="h-4 w-4 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">4</span>
                    </div>
                      Görüşme Türü ve Yeri
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      {/* Önce Görüşme Türü Seçimi */}
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Görüşme Türü
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData(prev => ({ ...prev, isOnline: true, roomId: '' }))}
                            className={`flex items-center p-1.5 rounded-lg transition-all duration-200 ${
                            formData.isOnline
                              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                            <div className={`p-1 rounded-full mr-1.5 ${
                            formData.isOnline
                              ? 'bg-white/20'
                              : 'bg-primary-100 dark:bg-primary-900/30'
                          }`}>
                              <Video size={12} className={formData.isOnline ? 'text-white' : 'text-primary-600 dark:text-primary-400'} />
                  </div>
                            <span className="font-medium text-xs">Online</span>
                          </motion.button>
                          
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData(prev => ({ ...prev, isOnline: false, roomId: '' }))}
                            className={`flex items-center p-1.5 rounded-lg transition-all duration-200 ${
                              !formData.isOnline
                                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className={`p-1 rounded-full mr-1.5 ${
                              !formData.isOnline
                                ? 'bg-white/20'
                                : 'bg-primary-100 dark:bg-primary-900/30'
                            }`}>
                              <Home size={12} className={!formData.isOnline ? 'text-white' : 'text-primary-600 dark:text-primary-400'} />
                          </div>
                            <span className="font-medium text-xs">Yüz Yüze</span>
                        </motion.button>
                        </div>
                      </div>
                      
                      {/* Sonra Oda Seçimi (Yüz Yüze seçildiğinde) */}
                      {!formData.isOnline ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Oda Seçimi <span className="text-red-500">*</span>
                          </label>
                          
                          <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                        {rooms
                              .filter(room => room.id !== 'online')
                              .length === 0 ? (
                                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                  Henüz oda eklenmemiş
                                </div>
                              ) : !availableRooms.some(room => room.id !== 'online') ? (
                                <div className="p-2 text-xs text-amber-600 dark:text-amber-400 text-center">
                                  Bu saatte müsait oda bulunmuyor
                                </div>
                              ) : (
                                rooms
                          .filter(room => room.id !== 'online')
                          .map(room => {
                            const isAvailable = availableRooms.some(r => r.id === room.id);
                            
                            return (
                              <motion.button
                            key={room.id}
                                type="button"
                                whileHover={isAvailable ? { scale: 1.02 } : { scale: 1 }}
                                whileTap={isAvailable ? { scale: 0.98 } : { scale: 1 }}
                                onClick={() => isAvailable && handleRoomChange(room.id)}
                                disabled={!isAvailable}
                                        className={`flex items-center w-full p-1.5 rounded-lg transition-all duration-200 ${
                                  formData.roomId === room.id
                                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                                    : isAvailable
                                    ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700 opacity-70'
                                }`}
                              >
                                        <div className={`p-1 rounded-full mr-1.5 ${
                                  formData.roomId === room.id
                                    ? 'bg-white/20'
                                    : isAvailable
                                    ? 'bg-primary-100 dark:bg-primary-900/30'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }`}>
                                          <Home size={12} className={
                                    formData.roomId === room.id
                                      ? 'text-white'
                                      : isAvailable
                                              ? 'text-primary-600 dark:text-primary-400'
                                              : 'text-gray-400 dark:text-gray-500'
                                  } />
                      </div>
                                <div className="flex-1 text-left">
                                          <p className="font-medium text-xs">{room.name}</p>
                                          <p className="text-[10px] opacity-80">
                                    {isAvailable 
                                      ? 'Müsait'
                                      : 'Bu saatte dolu'
                                    }
                                  </p>
                        </div>
                              </motion.button>
                            );
                          })
                              )}
                      </div>
                            </div>
                      ) : (
                        // Online görüşme seçildiğinde bilgi mesajı
                        <div className="p-2 mt-1 text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800/50">
                          Online görüşme seçildi. Oda seçimine gerek yok.
                </div>
              )}
                    </div>
                    </div>
                  </div>

                {/* Sağ Taraf - Notlar ve özet */}
                <div className="space-y-2 md:space-y-3">
                  {/* Notlar */}
                <div>
                    <h3 className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      <div className="h-4 w-4 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">5</span>
                    </div>
                      Randevu Notları
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <div>
                        <label htmlFor="notes" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notlar (Opsiyonel)
                    </label>
                        <div className="relative">
                          <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition-shadow text-xs"
                            placeholder="Randevu ile ilgili ekstra bilgiler..."
                          ></textarea>
                          <PencilLine size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Randevu Özeti */}
              {formData.clientId && formData.date && formData.time && (formData.isOnline || formData.roomId) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                      className="p-2 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-lg border border-primary-100 dark:border-primary-800/50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-pattern-dots opacity-5 pointer-events-none"></div>
                  
                      <h3 className="text-sm font-semibold text-primary-800 dark:text-primary-300 mb-2 flex items-center">
                        <CheckCircle2 size={16} className="mr-2 text-primary-600 dark:text-primary-400" />
                    Randevu Özeti
                  </h3>
                  
                      <div className="grid grid-cols-1 gap-1">
                        <div className="flex items-center text-xs bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg shadow-sm backdrop-blur-sm">
                          <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2">
                            <User size={12} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Danışan:</span> {clients.find(c => c.id === formData.clientId)?.full_name}
                      </p>
                    </div>
                    
                        <div className="flex items-center text-xs bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg shadow-sm backdrop-blur-sm">
                          <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2">
                            <Users size={12} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Uzman:</span> {professionals.find(p => p.id === formData.professionalId)?.full_name}
                    </p>
                  </div>
                    
                        <div className="flex items-center text-xs bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg shadow-sm backdrop-blur-sm">
                          <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2">
                            <Calendar size={12} className="text-primary-600 dark:text-primary-400" />
                </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Tarih:</span> {formatTurkishDate(formData.date)}
                      </p>
            </div>
                    
                        <div className="flex items-center text-xs bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg shadow-sm backdrop-blur-sm">
                          <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2">
                            <Clock size={12} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Saat:</span> {formData.time} ({formData.duration} dk)
                      </p>
          </div>

                        <div className="flex items-center text-xs bg-white/60 dark:bg-gray-800/60 p-2 rounded-lg shadow-sm backdrop-blur-sm">
                          <div className="p-1.5 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2">
                            <Home size={12} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Yer:</span> {
                          formData.isOnline
                            ? 'Online Görüşme'
                            : rooms.find(r => r.id === formData.roomId)?.name
                        }
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
                </div>
              </div>
            </form>
          </div>

          {/* Footer - Daha Kompakt */}
          <div className="p-1.5 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                İptal
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !formData.clientId ||
                  !formData.date ||
                  !formData.time ||
                  (!formData.isOnline && !formData.roomId)
                }
                className="flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-medium transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-indigo-600"
              >
                {loading ? (
                  <>
                    <Loader2 size={12} className="animate-spin mr-1" />
                    İşleniyor...
                  </>
                ) : (
                  <>
                Randevuyu Oluştur <CheckCircle2 size={12} className="ml-1" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
