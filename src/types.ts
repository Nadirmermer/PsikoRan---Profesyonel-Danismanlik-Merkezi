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

export interface TestResult {
  id: string;
  client_id: string;
  professional_id: string;
  test_type: string;
  score: number;
  answers: Record<string, any>;
  created_at: string;
  encrypted_answers?: string;
  encryption_key?: string;
  iv?: string;
  notes?: string;
  duration_seconds?: number;
  started_at?: string;
  completed_at?: string;
  is_public_access?: boolean;
} 