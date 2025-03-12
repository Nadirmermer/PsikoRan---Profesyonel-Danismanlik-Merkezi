import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  addMinutes,
  parseISO,
  isWithinInterval,
  addDays,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Calendar,
  DollarSign,
  Clock,
  Wallet,
  CreditCard,
  HandCoins,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CreateAppointmentModal } from '../components/CreateAppointmentModal';
import { Appointment, Client, Professional, Room, Payment } from '../types/database';

interface AppointmentWithRelations extends Appointment {
  client: Client;
  professional: Professional;
  room?: Room;
}

interface CashStatus {
  opening_balance: number;
  from_professionals: number;
  to_professionals: number;
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

const ROOM_COLORS = [
  'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
  'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
  'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
  'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
  'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300',
  'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300',
];

export function Dashboard() {
  const { professional, assistant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingClinicHours, setLoadingClinicHours] = useState(true);
  const [clinicHours, setClinicHours] = useState<ClinicHours | null>(null);
  const [professionalWorkingHours, setProfessionalWorkingHours] = useState<ClinicHours | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentWithRelations[]>([]);
  const [monthlyAppointments, setMonthlyAppointments] = useState<AppointmentWithRelations[]>([]);
  const [todayPayments, setTodayPayments] = useState<Payment[]>([]);
  const [monthlyPayments, setMonthlyPayments] = useState<Payment[]>([]);
  const [cashStatus, setCashStatus] = useState<CashStatus>({
    opening_balance: 0,
    from_professionals: 0,
    to_professionals: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    clientId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [duration, setDuration] = useState('45');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await loadClinicHours();
        await loadRooms();
        if (professional) {
          await loadProfessionalWorkingHours();
          await loadProfessionalData();
        } else if (assistant) {
          await loadAssistantData();
        }
      } finally {
        setLoading(false);
      }
    };

    if (professional || assistant) {
      initializeData();
    }
  }, [professional?.id, assistant?.id]);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay();
      const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
      const currentDay = days[dayOfWeek];
      const dayHours = clinicHours?.[currentDay];

      if (!dayHours?.isOpen) {
        setTimeSlots([]);
        return;
      }

      loadExistingAppointments(date.toISOString().split('T')[0]);
      setTimeSlots(generateTimeSlots(dayHours));
    }
  }, [selectedDate, clinicHours]);

  function generateTimeSlots(dayHours: { opening: string; closing: string; isOpen: boolean }) {
    if (!dayHours.isOpen) return [];

    const dayOfWeek = selectedDate.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];

    let openingHour, closingHour;

    if (professional) {
      // Ruh sağlığı uzmanı için hem kendi hem de klinik saatlerini kontrol et
      const profHours = professionalWorkingHours?.[currentDay];
      const clinicDayHours = clinicHours?.[currentDay];

      if (!profHours?.isOpen || !clinicDayHours?.isOpen) return [];

      // En geç başlangıç ve en erken bitiş saatlerini al
      const [profOpenHour] = profHours.opening.split(':').map(Number);
      const [profCloseHour] = profHours.closing.split(':').map(Number);
      const [clinicOpenHour] = clinicDayHours.opening.split(':').map(Number);
      const [clinicCloseHour] = clinicDayHours.closing.split(':').map(Number);

      openingHour = Math.max(profOpenHour, clinicOpenHour);
      closingHour = Math.min(profCloseHour, clinicCloseHour);
    } else {
      // Asistan için sadece klinik saatlerini kullan
      [openingHour] = dayHours.opening.split(':').map(Number);
      [closingHour] = dayHours.closing.split(':').map(Number);
    }

    const slots: string[] = [];
    let currentHour = openingHour;

    while (currentHour < closingHour) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
      currentHour += 1;
    }

    return slots;
  }

  function calculateAppointmentPosition(appointment: AppointmentWithRelations) {
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    const startMinute = startTime.getMinutes();
    
    // Dakikaya göre yüzdesel pozisyon hesapla (0-100 arası)
    const topPercentage = (startMinute / 60) * 100;
    
    // Randevu süresini dakika cinsinden hesapla
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    // Saatlik hücre yüksekliği 96px
    const hourHeight = 96;
    const height = (durationInMinutes / 60) * hourHeight;
    
    return {
      top: `${topPercentage}%`,
      height: `${height}px`,
      minHeight: '24px'
    };
  }

  function calculateAppointmentHeight(durationInMinutes: number) {
    const hourHeight = 120; // 1 saat = 120px
    return Math.max(118, (durationInMinutes / 60) * hourHeight); // Minimum 118px
  }

  function calculateTimeLinePosition() {
    const now = currentTime;
    const minutes = now.getMinutes();
    return `${(minutes / 60) * 100}%`;
  }

  async function loadClients() {
    try {
      let query = supabase
        .from('clients')
        .select('*, professional:professionals(id, full_name)')
        .order('full_name');

      if (professional) {
        // Eğer profesyonel ise sadece kendi danışanlarını göster
        query = query.eq('professional_id', professional.id);
      } else if (assistant) {
        // Eğer asistan ise, yönettiği tüm profesyonellerin danışanlarını göster
        const { data: managedProfessionals } = await supabase
          .from('professionals')
          .select('id')
          .eq('assistant_id', assistant.id);

        if (managedProfessionals && managedProfessionals.length > 0) {
          const professionalIds = managedProfessionals.map((p) => p.id);
          query = query.in('professional_id', professionalIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async function loadRooms() {
    try {
      let query = supabase.from('rooms').select('*').order('name');

      if (professional) {
        // Profesyonelin bağlı olduğu kliniğin odalarını getir
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

  async function loadClinicHours() {
    try {
      setLoadingClinicHours(true);
      let query = supabase.from('clinic_settings').select('*');
      
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

      query = query.order('created_at', { ascending: false }).limit(1);

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setClinicHours({
          pazartesi: {
            opening: data[0].opening_time_monday,
            closing: data[0].closing_time_monday,
            isOpen: data[0].is_open_monday
          },
          sali: {
            opening: data[0].opening_time_tuesday,
            closing: data[0].closing_time_tuesday,
            isOpen: data[0].is_open_tuesday
          },
          carsamba: {
            opening: data[0].opening_time_wednesday,
            closing: data[0].closing_time_wednesday,
            isOpen: data[0].is_open_wednesday
          },
          persembe: {
            opening: data[0].opening_time_thursday,
            closing: data[0].closing_time_thursday,
            isOpen: data[0].is_open_thursday
          },
          cuma: {
            opening: data[0].opening_time_friday,
            closing: data[0].closing_time_friday,
            isOpen: data[0].is_open_friday
          },
          cumartesi: {
            opening: data[0].opening_time_saturday,
            closing: data[0].closing_time_saturday,
            isOpen: data[0].is_open_saturday
          },
          pazar: {
            opening: data[0].opening_time_sunday,
            closing: data[0].closing_time_sunday,
            isOpen: data[0].is_open_sunday
          }
        });
      }
    } catch (error) {
      console.error('Error loading clinic hours:', error);
    } finally {
      setLoadingClinicHours(false);
    }
  }

  async function loadProfessionalData() {
    if (!professional?.id) return; // Profesyonel ID yoksa fonksiyondan çık
    
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);
      const startOfThisMonth = startOfMonth(today);
      const endOfThisMonth = endOfMonth(today);

      // Load today's appointments with full relations
      const { data: todayAppts, error: todayApptsError } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          room:rooms(*)
        `)
        .eq('professional_id', professional.id)
        .eq('status', 'scheduled')
        .gte('start_time', startOfToday.toISOString())
        .lte('start_time', endOfToday.toISOString())
        .order('start_time');

      if (todayApptsError) throw todayApptsError;

      // Load monthly appointments with full relations
      const { data: monthlyAppts, error: monthlyApptsError } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          room:rooms(*)
        `)
        .eq('professional_id', professional.id)
        .eq('status', 'scheduled')
        .gte('start_time', startOfThisMonth.toISOString())
        .lte('start_time', endOfThisMonth.toISOString())
        .order('start_time');

      if (monthlyApptsError) throw monthlyApptsError;

      // Load today's payments
      const { data: todayPays, error: todayPaysError } = await supabase
        .from('payments')
        .select(`
          *,
          appointment:appointments(
            *,
            client:clients(*),
            professional:professionals(*)
          )
        `)
        .eq('professional_id', professional.id)
        .gte('payment_date', startOfToday.toISOString())
        .lte('payment_date', endOfToday.toISOString())
        .order('payment_date');

      if (todayPaysError) throw todayPaysError;

      // Load monthly payments
      const { data: monthlyPays, error: monthlyPaysError } = await supabase
        .from('payments')
        .select(`
          *,
          appointment:appointments(
            *,
            client:clients(*),
            professional:professionals(*)
          )
        `)
        .eq('professional_id', professional.id)
        .gte('payment_date', startOfThisMonth.toISOString())
        .lte('payment_date', endOfThisMonth.toISOString())
        .order('payment_date');

      if (monthlyPaysError) throw monthlyPaysError;

      setTodayAppointments(todayAppts || []);
      setMonthlyAppointments(monthlyAppts || []);
      setTodayPayments(todayPays || []);
      setMonthlyPayments(monthlyPays || []);
    } catch (error) {
      console.error('Error loading professional dashboard data:', error);
    }
  }

  async function loadAssistantData() {
    if (!assistant?.id) return; // Asistan ID yoksa fonksiyondan çık

    try {
      const startToday = startOfDay(selectedDate);
      const endToday = endOfDay(selectedDate);
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Önce yönetilen profesyonelleri al
      const { data: managedProfessionals, error: profError } = await supabase
        .from('professionals')
        .select('id')
        .eq('assistant_id', assistant.id);

      if (profError) throw profError;

      const professionalIds = managedProfessionals?.map(p => p.id) || [];

      // Load today's appointments
      const { data: todayAppts, error: apptsError } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(full_name),
          professional:professionals(full_name),
          room:rooms(name)
        `)
        .in('professional_id', professionalIds)
        .eq('status', 'scheduled')
        .gte('start_time', startToday.toISOString())
        .lte('start_time', endToday.toISOString())
        .order('start_time');

      if (apptsError) throw apptsError;

      // Load today's payments
      const { data: todayPays, error: paysError } = await supabase
        .from('payments')
        .select(`
          *,
          appointment:appointments(
            *,
            professional:professionals(full_name),
            client:clients(full_name)
          )
        `)
        .in('professional_id', professionalIds)
        .gte('payment_date', startToday.toISOString())
        .lte('payment_date', endToday.toISOString())
        .order('payment_date');

      if (paysError) throw paysError;

      // Cash status için upsert kullan
      const { data: cashData, error: cashError } = await supabase
        .from('cash_status')
        .upsert(
          {
            assistant_id: assistant.id,
            date: formattedDate,
            opening_balance: 0
          },
          {
            onConflict: 'assistant_id,date',
            ignoreDuplicates: false
          }
        )
        .select()
        .single();

      if (cashError) {
        console.error('Error upserting cash status:', cashError);
        throw cashError;
      }

      setTodayAppointments(todayAppts || []);
      setTodayPayments(todayPays || []);
      setCashStatus({
        opening_balance: cashData?.opening_balance || 0,
        from_professionals:
          todayPays?.reduce((sum, payment) => {
            if (payment.payment_status === 'paid_to_professional') {
              return sum + Number(payment.office_amount);
            }
            return sum;
          }, 0) || 0,
        to_professionals:
          todayPays?.reduce((sum, payment) => {
            if (payment.payment_status === 'paid_to_office') {
              return sum + Number(payment.professional_amount);
            }
            return sum;
          }, 0) || 0,
      });
    } catch (error) {
      console.error('Error loading assistant dashboard data:', error);
    }
  }

  function getAppointmentForTimeSlotAndRoom(timeSlot: string, roomId: string) {
    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hour, minute, 0, 0);

    return todayAppointments.find((appointment) => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);

      return (
        appointment.room_id === roomId &&
        slotTime >= appointmentStart &&
        slotTime < appointmentEnd
      );
    });
  }

  function getAppointmentDuration(appointment: any) {
    const start = parseISO(appointment.start_time);
    const end = parseISO(appointment.end_time);
    // Saat cinsinden duration hesapla
    return Math.ceil((end.getTime() - start.getTime()) / (60 * 60 * 1000));
  }

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedClient = clients.find(
        (client) => client.id === formData.clientId
      );
      if (!selectedClient) {
        throw new Error('Danışan seçilmedi');
      }

      const professionalId = professional?.id || selectedClient.professional_id;
      if (!professionalId) {
        throw new Error('Ruh sağlığı uzmanı bulunamadı');
      }

      const startDateTime = new Date(formData.startTime);
      const endDateTime = new Date(
        startDateTime.getTime() + parseInt(duration) * 60000
      );

      const { error } = await supabase.from('appointments').insert({
        client_id: formData.clientId,
        professional_id: professionalId,
        room_id: formData.roomId || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: formData.notes || null,
        status: 'scheduled',
      });

      if (error) {
        if (error.message.includes('Cannot create appointments in the past')) {
          throw new Error('Geçmiş tarihe randevu oluşturulamaz.');
        }
        if (error.message.includes('Room is already booked')) {
          throw new Error(
            'Bu oda seçilen saatte başka bir randevu için ayrılmış.'
          );
        }
        if (error.message.includes('Professional already has an appointment')) {
          throw new Error(
            'Ruh sağlığı uzmanının bu saatte başka bir randevusu var.'
          );
        }
        throw error;
      }

      setFormData({
        clientId: '',
        roomId: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      setShowCreateModal(false);
      if (professional) {
        await loadProfessionalData();
      } else if (assistant) {
        await loadAssistantData();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Randevu oluşturulurken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadExistingAppointments(date: string) {
    try {
      const startTime = new Date(date);
      startTime.setHours(0, 0, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(23, 59, 59, 999);

      let query = supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startTime.toISOString())
        .lte('start_time', endTime.toISOString())
        .eq('status', 'scheduled');

      if (professional) {
        query = query.eq('professional_id', professional.id);
      } else if (assistant) {
        const { data: managedProfessionals } = await supabase
          .from('professionals')
          .select('id')
          .eq('assistant_id', assistant.id);

        if (managedProfessionals && managedProfessionals.length > 0) {
          const professionalIds = managedProfessionals.map((p) => p.id);
          query = query.in('professional_id', professionalIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      setExistingAppointments(data || []);
    } catch (error) {
      console.error('Error loading existing appointments:', error);
    }
  }

  function calculateAvailableTimeSlots(date: Date) {
    const dayOfWeek = date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    const dayHours = clinicHours?.[currentDay];

    if (!dayHours?.isOpen) {
      return [];
    }

    const slots: string[] = [];
    const [openingHour, openingMinute] = dayHours.opening.split(':').map(Number);
    const [closingHour, closingMinute] = dayHours.closing.split(':').map(Number);

    let currentHour = openingHour;
    let currentMinute = openingMinute;

    while (
      currentHour < closingHour ||
      (currentHour === closingHour && currentMinute <= closingMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute
        .toString()
        .padStart(2, '0')}`;

      const slotTime = new Date(date);
      slotTime.setHours(currentHour, currentMinute, 0, 0);
      
      const endTime = new Date(slotTime.getTime() + parseInt(duration) * 60000);

      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.start_time);
        const appointmentEnd = new Date(appointment.end_time);

        if (formData.roomId && appointment.room_id === formData.roomId) {
          return (
            (slotTime >= appointmentStart && slotTime < appointmentEnd) ||
            (endTime > appointmentStart && endTime <= appointmentEnd)
          );
        }

        if (professional && appointment.professional_id === professional.id) {
          return (
            (slotTime >= appointmentStart && slotTime < appointmentEnd) ||
            (endTime > appointmentStart && endTime <= appointmentEnd)
          );
        }

        return false;
      });

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

    return rooms.filter((room) => {
      const hasConflict = existingAppointments.some((appointment) => {
        if (appointment.room_id !== room.id) return false;

        const appointmentStart = new Date(appointment.start_time);
        const appointmentEnd = new Date(appointment.end_time);

        return (
          (startTime >= appointmentStart && startTime < appointmentEnd) ||
          (endTime > appointmentStart && endTime <= appointmentEnd)
        );
      });

      return !hasConflict;
    });
  }

  const handleRoomChange = (roomId: string) => {
    setFormData((prev) => {
      const startDate = prev.startTime ? new Date(prev.startTime.split('T')[0]) : selectedDate;
      return {
      ...prev,
      roomId,
      startTime:
        prev.startTime &&
          !calculateAvailableTimeSlots(startDate).includes(prev.startTime.split('T')[1]?.slice(0, 5))
          ? prev.startTime.split('T')[0]
          : prev.startTime,
      };
    });
  };

  const handleDateChange = (date: string) => {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    const dayHours = clinicHours?.[currentDay];

    if (!dayHours?.isOpen) {
      setTimeSlots([]);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      startTime: `${date}T${dayHours.opening}`,
    }));
  };

  const handleTimeChange = (time: string) => {
    const date = formData.startTime.split('T')[0] || new Date().toISOString().split('T')[0];
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    const dayHours = clinicHours?.[currentDay];

    if (!dayHours?.isOpen) {
      alert('Seçilen gün klinik kapalıdır.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      startTime: `${date}T${time}`,
      roomId: prev.roomId && !calculateAvailableRooms(date, time)
        .some(room => room.id === prev.roomId)
        ? ''
        : prev.roomId
    }));
  };

  useEffect(() => {
    if (formData.startTime) {
      const [date, time] = formData.startTime.split('T');
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay();
      const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
      const currentDay = days[dayOfWeek];
      const dayHours = clinicHours?.[currentDay];

      if (!dayHours?.isOpen) {
        alert('Seçilen gün klinik kapalıdır.');
        setFormData(prev => ({ ...prev, startTime: '' }));
        return;
      }

      if (formData.roomId) {
        setAvailableTimeSlots(calculateAvailableTimeSlots(selectedDate));
      } else {
        setAvailableTimeSlots(calculateAvailableTimeSlots(selectedDate));
      }

      if (time) {
        setAvailableRooms(calculateAvailableRooms(date, time.slice(0, 5)));
      }
    }
  }, [formData.startTime, formData.roomId, duration, selectedDate, existingAppointments]);

  // Klinik açık olan günleri kontrol eden fonksiyon
  const isClinicOpen = (date: Date) => {
    const dayOfWeek = date.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];

    if (professional) {
      // Ruh sağlığı uzmanı için hem kendi hem de klinik çalışma saatlerini kontrol et
      const profDay = professionalWorkingHours?.[currentDay];
      const clinicDay = clinicHours?.[currentDay];
      
      return (profDay?.isOpen && clinicDay?.isOpen) || false;
    } else {
      // Asistan için sadece klinik çalışma saatlerini kontrol et
      return clinicHours?.[currentDay]?.isOpen || false;
    }
  };

  async function loadProfessionalWorkingHours() {
    try {
      if (!professional?.id) return;

      // Doğrudan veriyi çekmeye çalış
      const { data, error } = await supabase
        .from('professional_working_hours')
        .select('*')
        .eq('professional_id', professional.id)
        .single();

      if (error) {
        console.error('Profesyonel çalışma saatleri yüklenirken hata:', error);
        // Hata durumunda varsayılan değerleri kullan
        setProfessionalWorkingHours({
          pazartesi: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          sali: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          carsamba: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          persembe: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          cuma: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          cumartesi: {
            opening: '09:00',
            closing: '18:00',
            isOpen: false
          },
          pazar: {
            opening: '09:00',
            closing: '18:00',
            isOpen: false
          }
        });
        return;
      }

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
        // Veri yoksa varsayılan değerleri kullan
        setProfessionalWorkingHours({
          pazartesi: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          sali: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          carsamba: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          persembe: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          cuma: {
            opening: '09:00',
            closing: '18:00',
            isOpen: true
          },
          cumartesi: {
            opening: '09:00',
            closing: '18:00',
            isOpen: false
          },
          pazar: {
            opening: '09:00',
            closing: '18:00',
            isOpen: false
          }
        });
      }
    } catch (error) {
      console.error('Profesyonel çalışma saatleri yüklenirken hata:', error);
      // Hata durumunda varsayılan değerleri kullan
      setProfessionalWorkingHours({
        pazartesi: {
          opening: '09:00',
          closing: '18:00',
          isOpen: true
        },
        sali: {
          opening: '09:00',
          closing: '18:00',
          isOpen: true
        },
        carsamba: {
          opening: '09:00',
          closing: '18:00',
          isOpen: true
        },
        persembe: {
          opening: '09:00',
          closing: '18:00',
          isOpen: true
        },
        cuma: {
          opening: '09:00',
          closing: '18:00',
          isOpen: true
        },
        cumartesi: {
          opening: '09:00',
          closing: '18:00',
          isOpen: false
        },
        pazar: {
          opening: '09:00',
          closing: '18:00',
          isOpen: false
        }
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  if (loadingClinicHours || !clinicHours) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        <p className="text-gray-600 dark:text-gray-400">
          Klinik çalışma saatleri yükleniyor...
        </p>
      </div>
    );
  }

  // Professional Dashboard
  if (professional) {
    const todayEarnings = todayPayments.reduce(
      (sum, payment) => sum + Number(payment.professional_amount),
      0
    );
    const monthlyEarnings = monthlyPayments.reduce(
      (sum, payment) => sum + Number(payment.professional_amount),
      0
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
          <div className="flex items-center justify-between lg:justify-start lg:gap-4 min-h-[48px]">
            <div className="lg:ml-10">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Hoş Geldiniz, {professional.full_name}
              </h1>
            </div>
          </div>

          {/* Takvim Görünümü */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Randevular
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="flex items-center w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white px-4 py-2 text-center appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Yeni Randevu
                </button>
              </div>
            </div>

            {/* Randevu tablosu */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-lg ring-1 ring-black/5 dark:ring-white/10 md:rounded-lg relative">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-xl sticky top-0 z-30">
                      <tr>
                        <th className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-xl text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 z-10 min-w-[100px] border-b border-gray-200 dark:border-gray-700">
                          Saat
                        </th>
                        {rooms.map((room: any, index: number) => (
                          <th
                            key={room.id}
                            className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-xl text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[200px] max-w-[250px] border-b border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${ROOM_COLORS[index % ROOM_COLORS.length].split(' ')[0]}`}></div>
                              <span>{room.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl divide-y divide-gray-200 dark:divide-gray-700">
                      {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot} className="relative hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors duration-200">
                          <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky left-0 z-20">
                            {timeSlot}
                          </td>
                          {rooms.map((room, index) => (
                            <td key={room.id} className="relative border-r border-gray-200 dark:border-gray-700 p-1 h-[96px]">
                              {todayAppointments
                                .filter(appointment => {
                                  const appointmentStart = new Date(appointment.start_time);
                                  const appointmentHour = appointmentStart.getHours();
                                  const slotHour = parseInt(timeSlot.split(':')[0]);
                                  return appointmentHour === slotHour && appointment.room_id === room.id;
                                })
                                .map(appointment => {
                                  const position = calculateAppointmentPosition(appointment);
                                  return (
                                    <div
                                      key={appointment.id}
                                      className={`absolute left-0 right-0 mx-2 p-2 rounded-lg shadow-sm ${
                                        ROOM_COLORS[index % ROOM_COLORS.length]
                                      } backdrop-blur-sm backdrop-filter transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer overflow-hidden`}
                                      style={{
                                        top: position.top,
                                        height: position.height,
                                        minHeight: position.minHeight,
                                        zIndex: 25
                                      }}
                                    >
                                      {professional ? (
                                        <div className="font-medium truncate">
                                          {appointment.client?.full_name}
                                        </div>
                                      ) : (
                                        <>
                                          <div className="font-medium text-base truncate">
                                            {appointment.professional?.full_name}
                                          </div>
                                          <div className="text-sm truncate opacity-90">
                                            {appointment.client?.full_name}
                                          </div>
                                        </>
                                      )}
                                      <div className="text-xs opacity-75">
                                        {format(new Date(appointment.start_time), 'HH:mm')} - 
                                        {format(new Date(appointment.end_time), 'HH:mm')}
                                      </div>
                                    </div>
                                  );
                                })}
                              {selectedDate && 
                                format(selectedDate, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd') && 
                                parseInt(timeSlot.split(':')[0]) === currentTime.getHours() && (
                                <div
                                  className="absolute left-0 right-0 border-t-2 border-red-500 pointer-events-none"
                                  style={{
                                    top: calculateTimeLinePosition(),
                                    zIndex: 20
                                  }}
                                />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* İstatistikler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Overview */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Bugün
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Randevular
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {todayAppointments.length}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Kazanç
                  </div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {todayEarnings.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Overview */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Bu Ay
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Toplam Randevu
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {monthlyAppointments.length}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Toplam Kazanç
                  </div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {monthlyEarnings.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Appointment Modal */}
          {showCreateModal && (
            <CreateAppointmentModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                if (professional) {
                  loadProfessionalData();
                } else if (assistant) {
                  loadAssistantData();
                }
              }}
              clinicHours={clinicHours}
            />
          )}
        </div>
      </div>
    );
  }

  // Assistant Dashboard
  const totalCash =
    cashStatus.opening_balance +
    cashStatus.from_professionals -
    cashStatus.to_professionals;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center justify-between lg:justify-start lg:gap-4 min-h-[48px]">
          <div className="lg:ml-10">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Hoş Geldiniz, {assistant.full_name}
            </h1>
          </div>
        </div>

        {/* Randevular bölümü */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          {/* Randevu başlık ve kontroller */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Randevular
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Tarih Kontrolleri */}
              <div className="flex items-center w-full sm:w-auto">
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 text-center appearance-none"
                />
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              {/* Yeni Randevu Butonu */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Yeni Randevu
              </button>
            </div>
          </div>

          {/* Randevu tablosu */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-lg ring-1 ring-black/5 dark:ring-white/10 md:rounded-lg relative">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-30">
                    <tr>
                      <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 z-10 min-w-[100px] border-b border-gray-200 dark:border-gray-700">
                        Saat
                      </th>
                      {rooms.map((room: any, index: number) => (
                        <th
                          key={room.id}
                          className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[200px] max-w-[250px] border-b border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${ROOM_COLORS[index % ROOM_COLORS.length].split(' ')[0]}`}></div>
                            <span>{room.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot} className="relative hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 sticky left-0 z-20">
                          {timeSlot}
                        </td>
                        {rooms.map((room, index) => (
                          <td key={room.id} className="relative border-r border-gray-200 dark:border-gray-700 p-1 h-[96px]">
                            {todayAppointments
                              .filter(appointment => {
                                const appointmentStart = new Date(appointment.start_time);
                                const appointmentHour = appointmentStart.getHours();
                                const slotHour = parseInt(timeSlot.split(':')[0]);
                                return appointmentHour === slotHour && appointment.room_id === room.id;
                              })
                              .map(appointment => {
                                const position = calculateAppointmentPosition(appointment);
                                return (
                                  <div
                                    key={appointment.id}
                                    className={`absolute left-0 right-0 mx-2 p-2 rounded-lg shadow-sm ${
                                      ROOM_COLORS[index % ROOM_COLORS.length]
                                    } backdrop-blur-sm backdrop-filter transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer overflow-hidden`}
                                    style={{
                                      top: position.top,
                                      height: position.height,
                                      minHeight: position.minHeight,
                                      zIndex: 25
                                    }}
                                  >
                                    {professional ? (
                                      <div className="font-medium truncate">
                                        {appointment.client?.full_name}
                                      </div>
                                    ) : (
                                      <>
                                        <div className="font-medium text-base truncate">
                                          {appointment.professional?.full_name}
                                        </div>
                                        <div className="text-sm truncate opacity-90">
                                          {appointment.client?.full_name}
                                        </div>
                                      </>
                                    )}
                                    <div className="text-xs opacity-75">
                                      {format(new Date(appointment.start_time), 'HH:mm')} - 
                                      {format(new Date(appointment.end_time), 'HH:mm')}
                                    </div>
                                  </div>
                                );
                              })}
                            {selectedDate && 
                              format(selectedDate, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd') && 
                              parseInt(timeSlot.split(':')[0]) === currentTime.getHours() && (
                              <div
                                className="absolute left-0 right-0 border-t-2 border-red-500 pointer-events-none"
                                style={{
                                  top: calculateTimeLinePosition(),
                                  zIndex: 20
                                }}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Kasa ve Ödemeler Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cash Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Kasa Durumu
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Açılış Bakiyesi
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {cashStatus.opening_balance.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Mevcut Bakiye
                </div>
                <div
                  className={`text-lg font-semibold ${
                    totalCash >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {totalCash.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Günlük Ödemeler
            </h2>
            <div className="space-y-3">
              {todayPayments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.appointment.client.full_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.appointment.professional.full_name}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      {Number(payment.amount).toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create Appointment Modal */}
        {showCreateModal && (
          <CreateAppointmentModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              if (professional) {
                loadProfessionalData();
              } else if (assistant) {
                loadAssistantData();
              }
            }}
            clinicHours={clinicHours}
          />
        )}
      </div>
    </div>
  );
}

// Yardımcı fonksiyonu ekleyin
function getAppointmentDurationInMinutes(appointment: any) {
  const start = parseISO(appointment.start_time);
  const end = parseISO(appointment.end_time);
  return (end.getTime() - start.getTime()) / (60 * 1000);
}
