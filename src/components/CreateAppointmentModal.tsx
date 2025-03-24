import { useState, useEffect } from 'react';
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
  Video
} from 'lucide-react';
import { format, isValid, parseISO, isWithinInterval, addMinutes } from 'date-fns';
import { tr } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    date: new Date(),
    time: '',
    duration: '45', // Varsayılan 45 dakika
    notes: '',
    isOnline: false
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

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Her fonksiyonu ayrı ayrı çağır, biri hata verirse diğerleri çalışmaya devam edebilsin
      try {
        await loadClients();
      } catch (error) {
        console.error('Danışan verileri yüklenirken hata:', error);
      }
      
      try {
        await loadRooms();
      } catch (error) {
        console.error('Oda verileri yüklenirken hata:', error);
      }
      
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
      
      // Professional ID varsa, o uzman için çalışma saatlerini ve tatillerini yükle
      if (professionalId) {
        setFormData(prev => ({ ...prev, professionalId }));
        
        try {
          await loadProfessionalWorkingHours(professionalId);
        } catch (error) {
          console.error('Uzman çalışma saatleri yüklenirken hata:', error);
        }
        
        try {
          await loadProfessionalBreaks(professionalId);
        } catch (error) {
          console.error('Uzman mola verileri yüklenirken hata:', error);
        }
        
        try {
          await loadProfessionalVacations(professionalId);
        } catch (error) {
          console.error('Uzman tatil verileri yüklenirken hata:', error);
        }
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
      console.error('Randevu verileri yüklenirken hata oluştu:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
    } finally {
      setLoading(false);
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
      if (!formData.isOnline && !formData.roomId) throw new Error('Görüşme yeri seçilmedi');
      
      // Randevu başlangıç ve bitiş zamanlarını hesapla
      const startDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);
      
      // Randevu oluştur
      const { error } = await supabase.from('appointments').insert({
        client_id: formData.clientId,
        professional_id: formData.professionalId,
        room_id: formData.isOnline ? null : formData.roomId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: formData.notes || null,
        status: 'scheduled',
        is_online: formData.isOnline
      });
      
      if (error) throw error;
      
      setSuccess('Randevu başarıyla oluşturuldu!');
      
      // Başarı mesajını gösterdikten sonra modalı kapat
      setTimeout(() => {
        // onSuccess fonksiyonunun varlığını kontrol et
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Randevu oluşturulurken hata:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Randevu oluşturulurken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto p-1 sm:p-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden w-full max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto relative my-1 sm:my-2"
        >
          {/* Arkaplan Efekti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-100 dark:bg-purple-900/20 blur-3xl opacity-70 dark:opacity-30"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-70 dark:opacity-30"></div>
          </div>

          {/* Header - Daha Kompakt */}
          <div className="relative bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-700 p-1.5 sm:p-2 text-white">
            <button
              onClick={onClose}
              className="absolute right-1.5 top-1.5 text-white hover:bg-white/20 rounded-full p-0.5 transition-colors z-10"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
            <div className="flex items-center space-x-1.5">
              <div className="flex-shrink-0 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Calendar size={14} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold">Yeni Randevu Oluştur</h2>
                <p className="text-xs text-white/80">Randevu bilgilerini doldurun</p>
              </div>
            </div>
          </div>

          {/* Form içeriği - maximum yükseklik azaltıldı */}
          <div className="p-2 sm:p-3 max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] overflow-y-auto relative">
            {loading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 z-10 flex items-center justify-center backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 shadow-lg animate-pulse">
                    <Loader2 size={28} className="animate-spin text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">İşleminiz gerçekleştiriliyor...</p>
                </div>
                </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-start"
              >
                <AlertCircle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 flex items-start"
              >
                <CheckCircle2 size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">

                {/* Sol Taraf - Danışan seçimi ve takvim */}
                <div className="space-y-2 md:space-y-4">
                  {/* Danışan Seçimi */}
                        <div>
                    <h3 className="flex items-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">1</span>
                          </div>
                      Danışan Bilgileri
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Danışan Seçin
                        </label>
                        <div className="relative">
                          <select
                            name="clientId"
                            value={formData.clientId}
                            onChange={handleInputChange}
                            className="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition-shadow"
                          >
                            <option value="">Danışan seçin</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>
                                {client.full_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                  </div>
              </div>

                      {/* Süre seçimi */}
                    <div>
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
                      
                      {formData.clientId && !professionalId && (
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-sm text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800/50">
                          <p>Danışan: {clients.find(c => c.id === formData.clientId)?.full_name}</p>
                          <p>Uzman: {professionals.find(p => p.id === formData.professionalId)?.full_name}</p>
                    </div>
                      )}
                  </div>
                </div>

              {/* Tarih Seçimi */}
              <div>
                    <h3 className="flex items-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">2</span>
                  </div>
                      Tarih Seçimi
                    </h3>
                    
                    {/* DatePicker konteyneri */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-full max-w-md mx-auto">
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                    <DatePicker
                              selected={formData.date}
                              onChange={handleDateChange}
                              locale={tr}
                              inline
                              dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                              filterDate={isClinicOpen}
                              calendarClassName="!bg-white dark:!bg-gray-800 !border-0 !font-sans w-full"
                              dayClassName={date => 
                                isClinicOpen(date) 
                                  ? 'text-gray-900 dark:text-gray-100 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              }
                              renderDayContents={(day, date) => (
                                <div className="w-10 h-8 flex items-center justify-center">
                                  {day}
                                </div>
                              )}
                            />
                          </div>
                </div>
              </div>

                      {formData.date && (
                        <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-100 dark:border-primary-800/50">
                          <p className="text-sm text-primary-700 dark:text-primary-300 text-center">
                            <span className="font-semibold">{formatTurkishDay(formData.date)}</span>, {formatTurkishDate(formData.date)}
                          </p>
                      </div>
                    )}
                  </div>
                </div>
            </div>

                {/* Sağ Taraf - Saat, oda ve notlar */}
                <div className="space-y-2 md:space-y-4">
              {/* Saat Seçimi */}
                <div>
                    <h3 className="flex items-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">3</span>
                    </div>
                      Saat Seçimi
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                        Randevu Saati
                    </label>
                      
                    {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto pr-1">
                          {availableTimeSlots.map(time => (
                            <motion.button
                            key={time}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTimeChange(time)}
                              className={`py-2 sm:py-2.5 px-1 rounded-lg text-center transition-all duration-200 text-sm sm:text-base ${
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
                        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-1.5 sm:p-2 flex-shrink-0">
                              <Clock size={14} className="text-amber-600 dark:text-amber-400 sm:h-4 sm:w-4" />
                        </div>
                            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                              Seçilen tarihte uygun randevu saati bulunamadı.
                            </p>
                          </div>
                      </div>
                    )}
                      
                      {formData.time && (
                        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-100 dark:border-primary-800/50">
                          <div className="flex items-center space-x-2">
                            <Clock size={14} className="text-primary-600 dark:text-primary-400 sm:h-4 sm:w-4" />
                            <p className="text-xs sm:text-sm text-primary-700 dark:text-primary-300">
                              Seçilen saat: <span className="font-semibold">{formData.time}</span>
                            </p>
                  </div>
                </div>
              )}
                    </div>
                  </div>

              {/* Oda Seçimi */}
                <div>
                    <h3 className="flex items-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">4</span>
                    </div>
                      Görüşme Yeri
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <div className="space-y-1.5 sm:space-y-2 max-h-36 sm:max-h-44 overflow-y-auto pr-1">
                        {/* Online Görüşme Seçeneği */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRoomChange('online')}
                          className={`flex items-center w-full p-2.5 sm:p-3 rounded-lg transition-all duration-200 ${
                            formData.isOnline
                              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className={`p-2 sm:p-2.5 rounded-full mr-3 ${
                            formData.isOnline
                              ? 'bg-white/20'
                              : 'bg-primary-100 dark:bg-primary-900/30'
                          }`}>
                            <Video size={16} className={formData.isOnline ? 'text-white' : 'text-primary-600 dark:text-primary-400 sm:h-[18px] sm:w-[18px]'} />
                  </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm sm:text-base">Online Görüşme</p>
                            <p className="text-[10px] sm:text-xs opacity-80">Video konferans ile uzaktan görüşme</p>
                          </div>
                        </motion.button>
                        
                        {/* Fiziksel Oda Seçenekleri */}
                        {rooms
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
                                className={`flex items-center w-full p-2.5 sm:p-3 rounded-lg transition-all duration-200 ${
                                  formData.roomId === room.id
                                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                                    : isAvailable
                                    ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700 opacity-70'
                                }`}
                              >
                                <div className={`p-2 sm:p-2.5 rounded-full mr-3 ${
                                  formData.roomId === room.id
                                    ? 'bg-white/20'
                                    : isAvailable
                                    ? 'bg-primary-100 dark:bg-primary-900/30'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }`}>
                                  <Home size={16} className={
                                    formData.roomId === room.id
                                      ? 'text-white'
                                      : isAvailable
                                      ? 'text-primary-600 dark:text-primary-400 sm:h-[18px] sm:w-[18px]'
                                      : 'text-gray-400 dark:text-gray-500 sm:h-[18px] sm:w-[18px]'
                                  } />
                      </div>
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-sm sm:text-base">{room.name}</p>
                                  <p className="text-xs sm:text-sm opacity-80">
                                    {isAvailable 
                                      ? 'Müsait'
                                      : 'Bu saatte dolu'
                                    }
                                  </p>
                        </div>
                              </motion.button>
                            );
                          })
                        }
                      </div>
                      
                      {!availableRooms.length && formData.time && (
                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-lg">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-1.5 sm:p-2 flex-shrink-0">
                              <Home size={14} className="text-amber-600 dark:text-amber-400 sm:h-4 sm:w-4" />
                            </div>
                            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                              Seçilen saat için uygun oda bulunamadı.
                            </p>
                  </div>
                </div>
              )}
                    </div>
                  </div>

                  {/* Notlar */}
                <div>
                    <h3 className="flex items-center text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary-100 dark:bg-primary-800/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-1.5">
                        <span className="text-xs font-bold">5</span>
                    </div>
                      Randevu Notları
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                      <div>
                        <label htmlFor="notes" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notlar (Opsiyonel)
                    </label>
                        <div className="relative">
                          <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition-shadow text-xs sm:text-sm"
                            placeholder="Randevu ile ilgili ekstra bilgiler..."
                          ></textarea>
                          <PencilLine size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none sm:h-4 sm:w-4" />
                  </div>
                      </div>
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
                  className="mt-3 sm:mt-4 p-2 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-lg border border-primary-100 dark:border-primary-800/50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-pattern-dots opacity-5 pointer-events-none"></div>
                  
                  <h3 className="text-base sm:text-lg font-semibold text-primary-800 dark:text-primary-300 mb-3 sm:mb-4 flex items-center">
                    <CheckCircle2 size={18} className="mr-2 text-primary-600 dark:text-primary-400 sm:h-5 sm:w-5" />
                    Randevu Özeti
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center text-xs sm:text-sm bg-white/60 dark:bg-gray-800/60 p-2.5 sm:p-3 rounded-lg shadow-sm backdrop-blur-sm">
                      <div className="p-1.5 sm:p-2 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2 sm:mr-3">
                        <User size={14} className="text-primary-600 dark:text-primary-400 sm:h-4 sm:w-4" />
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Danışan:</span> {clients.find(c => c.id === formData.clientId)?.full_name}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-xs sm:text-sm bg-white/60 dark:bg-gray-800/60 p-2.5 sm:p-3 rounded-lg shadow-sm backdrop-blur-sm">
                      <div className="p-1.5 sm:p-2 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2 sm:mr-3">
                        <Users size={14} className="text-primary-600 dark:text-primary-400 sm:h-4 sm:w-4" />
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Uzman:</span> {professionals.find(p => p.id === formData.professionalId)?.full_name}
                    </p>
                  </div>
                    
                    <div className="flex items-center text-xs sm:text-sm bg-white/60 dark:bg-gray-800/60 p-2.5 sm:p-3 rounded-lg shadow-sm backdrop-blur-sm">
                      <div className="p-1.5 sm:p-2 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2 sm:mr-3">
                        <Calendar size={14} className="text-primary-600 dark:text-primary-400 sm:h-4 sm:w-4" />
                </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Tarih:</span> {formatTurkishDate(formData.date)}
                      </p>
            </div>
                    
                    <div className="flex items-center text-xs sm:text-sm bg-white/60 dark:bg-gray-800/60 p-2.5 sm:p-3 rounded-lg shadow-sm backdrop-blur-sm">
                      <div className="p-1.5 sm:p-2 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2 sm:mr-3">
                        <Clock size={14} className="text-primary-600 dark:text-primary-400 sm:h-4 sm:w-4" />
                      </div>
                      <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Saat:</span> {formData.time} ({formData.duration} dk)
                      </p>
          </div>

                    <div className="flex items-center text-xs sm:text-sm bg-white/60 dark:bg-gray-800/60 p-2.5 sm:p-3 rounded-lg shadow-sm backdrop-blur-sm md:col-span-2">
                      <div className="p-1.5 sm:p-2 rounded-full bg-primary-100 dark:bg-primary-900/50 mr-2 sm:mr-3">
                        <Home size={14} className="text-primary-600 dark:text-primary-400 sm:h-4 sm:w-4" />
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
            </form>
          </div>

          {/* Footer - Daha Kompakt */}
          <div className="p-1.5 sm:p-2 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm">
            <div className="flex space-x-1.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onClose}
                className="px-2 py-1 sm:py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                İptal
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleSubmit}
                disabled={
                  !formData.clientId ||
                  !formData.date ||
                  !formData.time ||
                  (!formData.isOnline && !formData.roomId)
                }
                className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-medium transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-indigo-600"
              >
                Randevuyu Oluştur <CheckCircle2 size={12} className="ml-1" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
