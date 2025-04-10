import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Appointment, Professional } from '../types/database';
import {
  Plus,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Trash2,
  Undo,
  Bell,
  ExternalLink,
  Share2,
  Filter,
  CalendarDays,
  CalendarRange,
  CalendarIcon,
  ArrowDownUp,
  Users,
  MoreHorizontal,
  User,
  Clock,
  Edit
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addMonths, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../lib/auth';
import CreateAppointmentModal from '../components/appointment/CreateAppointmentModal';
import { requestNotificationPermission } from '../utils/notificationUtils';
import AppointmentShareModal from '../components/AppointmentShareModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';

type ViewType = 'daily' | 'weekly' | 'monthly' | 'all';

interface AppointmentFilters {
  status: string[];
  professionalId?: string;
  clientId?: string;
  roomId?: string;
  startDate?: Date;
  endDate?: Date;
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [duration, setDuration] = useState('45');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('weekly');
  const [recurrenceCount, setRecurrenceCount] = useState('4');
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: ['scheduled', 'completed', 'cancelled']
  });
  const [showFilters, setShowFilters] = useState(false);
  const [clinicHours, setClinicHours] = useState({
    pazartesi: { opening: '09:00', closing: '18:00', isOpen: true },
    sali: { opening: '09:00', closing: '18:00', isOpen: true },
    carsamba: { opening: '09:00', closing: '18:00', isOpen: true },
    persembe: { opening: '09:00', closing: '18:00', isOpen: true },
    cuma: { opening: '09:00', closing: '18:00', isOpen: true },
    cumartesi: { opening: '09:00', closing: '18:00', isOpen: false },
    pazar: { opening: '09:00', closing: '18:00', isOpen: false }
  });
  const [formData, setFormData] = useState({
    clientId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [sortBy, setSortBy] = useState('start_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const navigate = useNavigate();
  const { professional, assistant } = useAuth();
  const notificationRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Dışarıda herhangi bir yere tıklandığında dropdown menüleri kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationSettings(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationRef]);

  // URL parametrelerini kontrol et
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const newAppointment = queryParams.get('newAppointment');
    const clientId = queryParams.get('clientId');
    
    if (newAppointment === 'true') {
      // Modal'ı açarken clientId varsa ön seçili olarak ayarla
      setFormData(prev => ({
        ...prev,
        clientId: clientId || ''
      }));
      setShowCreateModal(true);
      
      // URL'yi temizle
      navigate('/randevular', { replace: true });
    }
  }, [navigate]);

  // Ana veri yükleme fonksiyonları
  useEffect(() => {
    loadAppointments();
    loadRooms();
    loadClinicHours();
    loadClients();
    loadProfessionals();
  }, [professional?.id, viewType, selectedDate, filters, sortBy, sortOrder]);

  async function loadAppointments() {
    try {
      setLoading(true);
      let startDate: Date;
      let endDate: Date;

      switch (viewType) {
        case 'daily':
          startDate = startOfDay(selectedDate);
          endDate = endOfDay(selectedDate);
          break;
        case 'weekly':
          startDate = startOfWeek(selectedDate, { locale: tr });
          endDate = endOfWeek(selectedDate, { locale: tr });
          break;
        case 'monthly':
          startDate = startOfMonth(selectedDate);
          endDate = endOfMonth(selectedDate);
          break;
        default:
          startDate = new Date(0); // Unix epoch start
          endDate = new Date(8640000000000000); // Maximum date
      }

      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          room:rooms(*)
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Zaman aralığına göre filtreleme
      if (viewType !== 'all') {
        query = query
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString());
      }

      // Duruma göre filtreleme
      if (filters.status && filters.status.length > 0 && filters.status.length < 3) {
        query = query.in('status', filters.status);
      }

      // Kişiye göre filtreleme
      if (professional) {
        query = query.eq('professional_id', professional.id);
      } else if (assistant) {
        const { data: managedProfessionals } = await supabase
          .from('professionals')
          .select('id')
          .eq('assistant_id', assistant.id);

        if (managedProfessionals) {
          const professionalIds = managedProfessionals.map(p => p.id);
          query = query.in('professional_id', professionalIds);
        }
      }

      // Diğer filtreleme seçenekleri
      if (filters.professionalId) {
        query = query.eq('professional_id', filters.professionalId);
      }
      
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      
      if (filters.roomId) {
        query = query.eq('room_id', filters.roomId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Randevular yüklenirken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRooms() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Odalar yüklenirken hata oluştu:', error);
    }
  }

  async function loadClinicHours() {
    try {
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
      console.error('Klinik saatleri yüklenirken hata oluştu:', error);
    }
  }

  async function loadClients() {
    try {
      let query = supabase
        .from('clients')
        .select('*, professional:professionals(id)')
        .order('full_name');

      if (professional) {
        query = query.eq('professional_id', professional.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Danışanlar yüklenirken hata oluştu:', error);
    }
  }

  async function loadProfessionals() {
    if (!assistant) return;
    
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('assistant_id', assistant.id)
        .order('full_name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Uzmanlar yüklenirken hata oluştu:', error);
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
          const professionalIds = managedProfessionals.map(p => p.id);
          query = query.in('professional_id', professionalIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setExistingAppointments(data || []);
    } catch (error) {
      console.error('Mevcut randevular yüklenirken hata oluştu:', error);
    }
  }

  function handleStatusChange(status: string) {
    setFilters(prev => {
      // Status zaten varsa kaldır, yoksa ekle
      const newStatus = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];
      
      return {
        ...prev,
        status: newStatus
      };
    });
  }

  function resetFilters() {
    setFilters({
      status: ['scheduled', 'completed', 'cancelled']
    });
    setSortBy('start_time');
    setSortOrder('asc');
  }

  function handleSortChange(field: string) {
    if (sortBy === field) {
      // Aynı alana tıklandıysa sıralama yönünü değiştir
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Farklı bir alana tıklandıysa, o alanı seç ve varsayılan 'asc' yap
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  function calculateAvailableTimeSlots(date: string, roomId?: string) {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const days = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'] as const;
    const currentDay = days[dayOfWeek];
    const dayHours = clinicHours[currentDay];

    if (!dayHours.isOpen || !dayHours.opening || !dayHours.closing) return [];

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

        if (roomId && appointment.room_id === roomId) {
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

    return rooms.filter(room => {
      const hasConflict = existingAppointments.some(appointment => {
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

  useEffect(() => {
    if (formData.startTime) {
      const [date] = formData.startTime.split('T');
      const [, time] = formData.startTime.split('T');
      
      if (date !== selectedDate.toISOString().split('T')[0]) {
        setSelectedDate(new Date(date));
        loadExistingAppointments(date);
      }

      if (formData.roomId) {
        setAvailableTimeSlots(calculateAvailableTimeSlots(date, formData.roomId));
      } else {
        setAvailableTimeSlots(calculateAvailableTimeSlots(date));
      }

      if (time) {
        setAvailableRooms(calculateAvailableRooms(date, time.slice(0, 5)));
      }
    }
  }, [formData.startTime, formData.roomId, duration, selectedDate, existingAppointments]);

  const handleRoomChange = (roomId: string) => {
    setFormData(prev => ({
      ...prev,
      roomId,
      startTime: prev.startTime && !calculateAvailableTimeSlots(selectedDate.toISOString().split('T')[0], roomId)
        .includes(prev.startTime.split('T')[1]?.slice(0, 5))
        ? prev.startTime.split('T')[0]
        : prev.startTime
    }));
  };

  const handleTimeChange = (time: string) => {
    const date = formData.startTime.split('T')[0] || new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      startTime: `${date}T${time}`,
      roomId: prev.roomId && !calculateAvailableRooms(date, time)
        .some(room => room.id === prev.roomId)
        ? ''
        : prev.roomId
    }));
  };

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedClient = clients.find(client => client.id === formData.clientId);
      if (!selectedClient) {
        throw new Error('Danışan seçilmedi');
      }

      const professionalId = professional?.id || selectedClient.professional_id;
      if (!professionalId) {
        throw new Error('Ruh sağlığı uzmanı bulunamadı');
      }

      const appointments = [];
      const startDateTime = new Date(formData.startTime);
      let currentDate = startDateTime;

      const count = isRecurring ? parseInt(recurrenceCount) : 1;

      for (let i = 0; i < count; i++) {
        const endDateTime = new Date(
          currentDate.getTime() + parseInt(duration) * 60000
        );

        appointments.push({
          client_id: formData.clientId,
          professional_id: professionalId,
          room_id: formData.roomId || null,
          start_time: currentDate.toISOString(),
          end_time: endDateTime.toISOString(),
          notes: formData.notes || null,
          status: 'scheduled',
        });

        if (recurrenceFrequency === 'weekly') {
          currentDate = addDays(currentDate, 7);
        } else if (recurrenceFrequency === 'monthly') {
          currentDate = addMonths(currentDate, 1);
        }
      }

      const { error } = await supabase
        .from('appointments')
        .insert(appointments);

      if (error) {
        if (error.message.includes('Cannot create appointments in the past')) {
          throw new Error('Geçmiş tarihe randevu oluşturulamaz.');
        }
        if (error.message.includes('Room is already booked')) {
          throw new Error('Bu oda seçilen saatte başka bir randevu için ayrılmış.');
        }
        if (error.message.includes('Professional already has an appointment')) {
          throw new Error('Ruh sağlığı uzmanının bu saatte başka bir randevusu var.');
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
      setDuration('45');
      setIsRecurring(false);
      setRecurrenceFrequency('weekly');
      setRecurrenceCount('4');
      setShowCreateModal(false);
      await loadAppointments();
    } catch (error) {
      console.error('Randevu oluşturulurken hata oluştu:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Randevu oluşturulurken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateAppointmentStatus(
    appointmentId: string,
    status: 'completed' | 'cancelled' | 'scheduled'
  ) {
    try {
      // If cancelling, ask for confirmation
      if (status === 'cancelled' && !window.confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?')) {
        return;
      }

      // If reverting from completed to scheduled, ask for confirmation and delete payment record
      if (status === 'scheduled') {
        const { data: appointment } = await supabase
          .from('appointments')
          .select('status')
          .eq('id', appointmentId)
          .single();

        if (appointment?.status === 'completed') {
          if (!window.confirm('Bu işlem randevuya ait ödeme kaydını da silecektir. Devam etmek istiyor musunuz?')) {
            return;
          }

          // Delete associated payment record
          const { error: paymentDeleteError } = await supabase
            .from('payments')
            .delete()
            .eq('appointment_id', appointmentId);

          if (paymentDeleteError) throw paymentDeleteError;
        }
      }

      // Update the appointment status
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (appointmentError) throw appointmentError;

      // If the appointment is marked as completed, create a payment record
      if (status === 'completed') {
        // Get the appointment details with client and professional info
        const { data: appointmentData, error: fetchError } = await supabase
          .from('appointments')
          .select(`
            *,
            client:clients(session_fee, professional_share_percentage, clinic_share_percentage),
            professional:professionals(*)
          `)
          .eq('id', appointmentId)
          .single();

        if (fetchError) throw fetchError;

        if (appointmentData && appointmentData.client) {
          const sessionFee = appointmentData.client.session_fee;
          const professionalShare = (sessionFee * appointmentData.client.professional_share_percentage) / 100;
          const clinicShare = (sessionFee * appointmentData.client.clinic_share_percentage) / 100;

          // Create payment record
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              appointment_id: appointmentId,
              professional_id: appointmentData.professional_id,
              amount: sessionFee,
              professional_amount: professionalShare,
              clinic_amount: clinicShare,
              payment_status: 'pending',
              collected_by: 'clinic',
              payment_date: new Date().toISOString()
            });

          if (paymentError) throw paymentError;
        }
      }

      await loadAppointments();
    } catch (error) {
      console.error('Randevu durumu güncellenirken hata oluştu:', error);
      alert('Randevu durumu güncellenirken bir hata oluştu.');
    }
  }

  async function handleDeleteAppointment(appointmentId: string) {
    if (!window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      await loadAppointments();
      alert('Randevu başarıyla silindi.');
    } catch (error) {
      console.error('Randevu silinirken hata oluştu:', error);
      alert('Randevu silinirken bir hata oluştu.');
    }
  }

  // Bildirim izni isteyen fonksiyon
  const handleRequestNotifications = async () => {
    try {
      if (!professional && !assistant) {
        alert('Bildirim izni istemek için giriş yapmalısınız');
        return;
      }

      let userType: 'professional' | 'assistant' | 'client' = 'client';
      
      if (professional) {
        userType = 'professional';
      } else if (assistant) {
        userType = 'assistant';
      }

      const success = await requestNotificationPermission(professional?.id || assistant?.id, userType);
      
      if (success) {
        alert('Bildirim izni başarıyla alındı. Artık randevu hatırlatmaları alacaksınız.');
      } else {
        alert('Bildirim izni alınamadı veya reddedildi.');
      }
    } catch (error) {
      console.error('Bildirim izni isteme hatası:', error);
      alert('Bildirim izni istenirken bir hata oluştu.');
    }
  };

  // Bildirimleri test etmek için fonksiyon
  const handleTestNotification = () => {
    if (Notification.permission !== 'granted') {
      alert('Bildirim göndermek için bildirim iznine ihtiyaç var. Lütfen önce bildirim izni verin.');
      return;
    }

    // Test bildirimi gönder
    const notification = new Notification('Test Randevu Hatırlatması', {
      body: 'Bu bir test bildirimidir. Gerçek randevularınız için otomatik hatırlatmalar alacaksınız.',
      icon: 'favicon.ico',
      badge: 'favicon-32x32.png',
      tag: 'test-notification'
    });

    // Bildirime tıklandığında
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  // Paylaşım modalını açmak için fonksiyon
  const handleOpenShareModal = (appointment: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Tıklamanın üst elementi etkilemesini engelle
    setSelectedAppointment(appointment);
    setShowShareModal(true);
  };

  function handleDateChange(days: number) {
    const newDate = addDays(selectedDate, days);
    setSelectedDate(newDate);
  }

  function getViewTitle() {
    switch (viewType) {
      case 'daily':
        return format(selectedDate, 'PPP', { locale: tr });
      case 'weekly':
        return `${format(startOfWeek(selectedDate, { locale: tr }), 'PPP', { locale: tr })} - ${format(endOfWeek(selectedDate, { locale: tr }), 'PPP', { locale: tr })}`;
      case 'monthly':
        return format(selectedDate, 'MMMM yyyy', { locale: tr });
      default:
        return 'Tüm Randevular';
    }
  }

  // Filtreleme sonrası sonuçları hesaplama
  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.professional?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.room?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [appointments, searchTerm]);

  const handleEditAppointment = (appointment: Appointment) => {
    navigate(`/randevular/duzenle/${appointment.id}`);
  };

  const handleViewAppointment = (appointmentId: string) => {
    navigate(`/randevular/${appointmentId}`);
  };

  if (loading) {
    return (
      <LoadingSpinner fullPage size="medium" showLoadingText={false} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı ve Üst Bölüm */}
      <div className="relative">
        {/* Arkaplan Dekoratif Elementler */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(120,119,198,0.1),transparent)]"></div>
          <div className="absolute -right-40 -top-40 w-96 h-96 rounded-full opacity-30 bg-primary-400 dark:bg-primary-600 blur-3xl"></div>
          <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full opacity-20 bg-indigo-400 dark:bg-indigo-600 blur-3xl"></div>
        </div>

        {/* Ana İçerik */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md shadow-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
          {/* Başlık ve Hızlı İşlemler */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
            >
          Randevular
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end"
            >
          {/* Bildirim Ayarları Butonu */}
              <div className="relative z-30 w-full sm:w-auto" ref={notificationRef}>
            <button
              onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                  className="w-full sm:w-auto px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-200 flex items-center justify-center sm:justify-start space-x-2"
            >
              <Bell className="h-4 w-4" />
                  <span>Bildirimler</span>
            </button>
            
            {showNotificationSettings && (
                  <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 sm:left-auto top-auto sm:top-full mt-4 sm:mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:w-64 md:w-72 z-40">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Bildirim Ayarları</h3>
                    <div className="space-y-3">
                  <button
                    onClick={handleRequestNotifications}
                        className="w-full px-3 py-3 text-sm text-center sm:text-left bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200"
                  >
                    Bildirimlere İzin Ver
                  </button>
                  <button
                    onClick={handleTestNotification}
                        className="w-full px-3 py-3 text-sm text-center sm:text-left bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/30 text-purple-600 dark:text-purple-400 rounded-lg transition-all duration-200"
                  >
                    Bildirim Testi
                  </button>
                </div>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 break-words">
                  {Notification.permission === 'granted' 
                    ? 'Bildirim izni aktif. Randevu hatırlatmaları alacaksınız.' 
                    : 'Bildirim izni pasif. Randevu hatırlatmaları almak için izin vermeniz gerekiyor.'}
                </div>
              </div>
            )}
          </div>
          
              {/* Yeni Randevu Oluştur Butonu */}
          <button
            onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-600/20 dark:shadow-blue-600/10 transition-all duration-200 flex items-center justify-center sm:justify-start space-x-2"
          >
            <Plus className="h-4 w-4" />
                <span className="font-medium">Yeni Randevu</span>
          </button>
            </motion.div>
      </div>

          {/* Filtreler ve Kontroller */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col space-y-4 mb-6"
          >
            {/* Üst Kontroller (Görünüm, Tarih, Arama) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
                {/* Görünüm Türü Seçimi */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex space-x-1">
                  <button
                    onClick={() => setViewType('daily')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewType === 'daily'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>Günlük</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewType('weekly')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewType === 'weekly'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Haftalık</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewType('monthly')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewType === 'monthly'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <CalendarRange className="h-3.5 w-3.5" />
                      <span>Aylık</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewType('all')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      viewType === 'all'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span>Tümü</span>
                  </button>
                </div>

          {viewType !== 'all' && (
                  <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => handleDateChange(-1)}
                      className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
              >
                      <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        isToday(selectedDate)
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                      }`}
              >
                Bugün
              </button>
              <button
                onClick={() => handleDateChange(1)}
                      className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
              >
                      <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>

              {/* Sağ Taraf - Arama ve Filtreler */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Arama */}
                <div className="relative w-full md:w-auto flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Randevu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Filtreleme */}
                <div className="relative z-20" ref={filterRef}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filtrele</span>
                  </button>
                  
                  {showFilters && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-30">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Randevu Filtreleri</h3>
                      
                      <div className="space-y-4">
                        {/* Durum Filtreleri */}
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Durum
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleStatusChange('scheduled')}
                              className={`px-2 py-1 text-xs rounded-md transition-all ${
                                filters.status.includes('scheduled')
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400'
                              }`}
                            >
                              Planlanmış
                            </button>
                            <button
                              onClick={() => handleStatusChange('completed')}
                              className={`px-2 py-1 text-xs rounded-md transition-all ${
                                filters.status.includes('completed')
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400'
                              }`}
                            >
                              Tamamlanmış
                            </button>
                            <button
                              onClick={() => handleStatusChange('cancelled')}
                              className={`px-2 py-1 text-xs rounded-md transition-all ${
                                filters.status.includes('cancelled')
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400'
                              }`}
                            >
                              İptal Edilmiş
                            </button>
        </div>
      </div>

                        {/* Uzman Filtreleri - Sadece asistanlar için */}
                        {assistant && professionals.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Uzman
                            </label>
                            <select
                              value={filters.professionalId || ''}
                              onChange={(e) => setFilters(prev => ({
                                ...prev, 
                                professionalId: e.target.value || undefined
                              }))}
                              className="w-full h-8 px-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                            >
                              <option value="">Tüm Uzmanlar</option>
                              {professionals.map(prof => (
                                <option key={prof.id} value={prof.id}>
                                  {prof.full_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Oda Filtreleri */}
                        {rooms.length > 0 && (
                          <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                              Oda
                            </label>
                            <select
                              value={filters.roomId || ''}
                              onChange={(e) => setFilters(prev => ({
                                ...prev, 
                                roomId: e.target.value || undefined
                              }))}
                              className="w-full h-8 px-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                            >
                              <option value="">Tüm Odalar</option>
                              <option value="null">Çevrimiçi</option>
                              {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                  {room.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={resetFilters}
                            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-md transition-all"
                          >
                            Filtreleri Sıfırla
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sıralama Butonu */}
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/40 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <ArrowDownUp className="h-4 w-4" />
                  <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Artan' : 'Azalan'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tarih Başlığı */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
        {getViewTitle()}
            </h2>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAppointments.length} randevu
      </div>
          </motion.div>

          {/* Randevu Tablosu */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
                  <tr className="bg-gray-50/70 dark:bg-gray-700/40">
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70"
                      onClick={() => handleSortChange('start_time')}
                    >
                      <div className="flex items-center">
                        <span>Tarih/Saat</span>
                        {sortBy === 'start_time' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                </th>
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70"
                      onClick={() => handleSortChange('client_id')}
                    >
                      <div className="flex items-center">
                        <span>Danışan</span>
                        {sortBy === 'client_id' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                </th>
                {assistant && (
                      <th 
                        className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70"
                        onClick={() => handleSortChange('professional_id')}
                      >
                        <div className="flex items-center">
                          <span>Uzman</span>
                          {sortBy === 'professional_id' && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                  </th>
                )}
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70"
                      onClick={() => handleSortChange('room_id')}
                    >
                      <div className="flex items-center">
                        <span>Oda</span>
                        {sortBy === 'room_id' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                </th>
                    <th 
                      className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/70"
                      onClick={() => handleSortChange('status')}
                    >
                      <div className="flex items-center">
                        <span>Durum</span>
                        {sortBy === 'status' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                </th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={assistant ? 6 : 5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">Randevu Bulunamadı</p>
                          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-4">
                            Seçilen kriterlere uygun randevu bulunamadı. Filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
                          </p>
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Yeni Randevu Oluştur</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment, index) => (
                      <motion.tr 
                  key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors duration-150 cursor-pointer"
                  onClick={() => handleViewAppointment(appointment.id)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(appointment.start_time), 'PPP', {
                        locale: tr,
                      })}
                    </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="inline h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                      {format(new Date(appointment.start_time), 'HH:mm', {
                        locale: tr,
                      })}{' '}
                      -
                      {format(new Date(appointment.end_time), 'HH:mm', {
                        locale: tr,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-medium">
                              {appointment.client?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                            </div>
                            <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {appointment.client?.full_name || "İsimsiz Danışan"}
                              </div>
                              {appointment.client?.email && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {appointment.client.email}
                                </div>
                              )}
                            </div>
                    </div>
                  </td>
                  {assistant && (
                    <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-medium">
                                {appointment.professional?.full_name?.charAt(0) || <User className="h-4 w-4" />}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {appointment.professional?.full_name || "Bilinmiyor"}
                                </div>
                                {appointment.professional?.title && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {appointment.professional.title}
                                  </div>
                                )}
                              </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                          <div className="flex items-center">
                            {(appointment as any).is_online ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 mr-1.5"></div>
                                Çevrimiçi
                              </span>
                            ) : appointment.room?.name ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
                                <div className="w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 mr-1.5"></div>
                                {appointment.room.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 mr-1.5"></div>
                                Belirtilmemiş
                              </span>
                            )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                          {appointment.status === 'completed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Tamamlandı
                    </span>
                          ) : appointment.status === 'cancelled' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              İptal Edildi
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              Planlandı
                            </span>
                          )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      {appointment.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                                  className="p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-400/10 rounded-lg transition-colors duration-150"
                            title="Tamamlandı"
                          >
                                  <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                                  className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10 rounded-lg transition-colors duration-150"
                            title="İptal Et"
                          >
                                  <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                        <button
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'scheduled')}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-400/10 rounded-lg transition-colors duration-150"
                          title="Planlanmış durumuna geri al"
                        >
                                <Undo className="h-4 w-4" />
                        </button>
                      )}
                      {(appointment as any).is_online && (appointment as any).meeting_url && (
                        <button
                          onClick={(e) => handleOpenShareModal(appointment, e)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-400/10 rounded-lg transition-colors duration-150"
                          title="Bağlantıyı Paylaş"
                        >
                                <Share2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-400/10 rounded-lg transition-colors duration-150"
                        title="Sil"
                      >
                              <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppointment(appointment);
                        }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-400/10 rounded-lg transition-colors duration-150"
                        title="Düzenle"
                      >
                              <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                      </motion.tr>
                    ))
                  )}
            </tbody>
          </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modallar */}
      {/* Randevu Oluşturma Modalı */}
      {showCreateModal && (
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onAppointmentCreated={loadAppointments}
          externalClinicHours={clinicHours}
        />
      )}

      {/* Randevu Paylaşım Modalı */}
      {showShareModal && selectedAppointment && (
        <AppointmentShareModal
          show={showShareModal}
          onHide={() => {
            setShowShareModal(false);
            setSelectedAppointment(null);
          }}
          appointmentInfo={{
            id: selectedAppointment.id,
            client: {
              full_name: selectedAppointment.client?.full_name,
              email: selectedAppointment.client?.email
            },
            professional: {
              full_name: selectedAppointment.professional?.full_name,
              title: selectedAppointment.professional?.title
            },
            start_time: selectedAppointment.start_time,
            meeting_url: selectedAppointment.meeting_url
          }}
        />
      )}
    </div>
  );
}