export interface DayHours {
  opening: string;
  closing: string;
  isOpen: boolean;
}

export interface ClinicHours {
  pazartesi: DayHours;
  sali: DayHours;
  carsamba: DayHours;
  persembe: DayHours;
  cuma: DayHours;
  cumartesi: DayHours;
  pazar: DayHours;
}

export interface Professional {
  id: string;
  user_id: string;
  full_name: string;
  title?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  profile_image_url?: string;
  bio?: string;
  education?: string[];
  experience?: string[];
  certifications?: string[];
  assistant_id?: string;
  is_available?: boolean;
  working_hours?: ClinicHours;
}

export interface Assistant {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  clinic_name: string;
  profile_image_url?: string;
}

export interface Client {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  notes?: string;
  created_at: string;
  professional_id?: string;
  assistant_id?: string;
} 