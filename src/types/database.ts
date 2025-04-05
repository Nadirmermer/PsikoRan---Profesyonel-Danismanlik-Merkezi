export interface Professional {
  id: string;
  created_at: string;
  user_id: string;
  full_name: string;
  title?: string;
  email?: string;
  phone?: string;
  assistant_id: string;
  specialization: string | null;
  status: string;
  profile_image_url: string | null;
}

export interface Assistant {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  clinic_name?: string;
  created_at: string;
  address: string | null;
  status: string;
  profile_image_url: string | null;
}

export interface Client {
  id: string;
  created_at: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  notes?: string;
  session_fee: number;
  professional_share_percentage: number;
  clinic_share_percentage: number;
  professional_id: string;
  professional?: Professional;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  status: string;
}

export interface Room {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  capacity: number;
  assistant_id: string;
}

export interface Appointment {
  id: string;
  created_at: string;
  client_id: string;
  professional_id: string;
  room_id?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  client?: Client;
  professional?: Professional;
  room?: Room;
  is_online?: boolean;
  meeting_url?: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  professional_id: string;
  amount: number;
  professional_amount: number;
  clinic_amount: number;
  payment_method?: 'cash' | 'credit_card';
  payment_status: 'pending' | 'paid_to_clinic' | 'paid_to_professional';
  collected_by: 'clinic' | 'professional';
  payment_date: string;
  created_at: string;
  appointment?: {
    client?: {
      full_name: string;
    };
    professional?: {
      full_name: string;
    };
  };
  notes: string | null;
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

// Abonelik ve Ödeme Tipleri

export type PlanType = 'starter' | 'growth' | 'clinic' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'pending_payment' | 'trial' | 'past_due';
export type BillingCycle = 'monthly' | 'annual';
export type PaymentMethod = 'iyzico' | 'bank_transfer';
export type PaymentStatus = 'successful' | 'failed' | 'pending_verification' | 'verified';

export interface Subscription {
  id: string; // UUID
  assistant_id: string; // assistants(id) ilişkisi
  plan_type: PlanType;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  start_date?: string | null; // ISO 8601 formatında timestampz
  current_period_start?: string | null; // ISO 8601 formatında timestampz
  current_period_end?: string | null; // ISO 8601 formatında timestampz
  trial_start?: string | null; // ISO 8601 formatında timestampz
  trial_end?: string | null; // ISO 8601 formatında timestampz
  cancel_at_period_end?: boolean; 
  cancelled_at?: string | null; // ISO 8601 formatında timestampz
  created_at: string; // ISO 8601 formatında timestampz
  updated_at: string; // ISO 8601 formatında timestampz
  iyzico_subscription_id?: string | null; // Iyzico abonelik ID
  iyzico_plan_code?: string | null; // Iyzico plan kodu
  payment_method?: PaymentMethod | null; // YENİ: Aboneliğin yönetim şekli
}

export interface SubscriptionPayment {
  id: string; // uuid
  subscription_id: string; // uuid
  amount: number;
  currency: string;
  payment_date: string; // timestamptz
  payment_method: PaymentMethod;
  status: PaymentStatus;
  iyzico_transaction_id?: string | null;
  bank_transfer_reference?: string | null;
  verified_by_admin_id?: string | null; // uuid
  verified_at?: string | null; // timestamptz
  notes?: string | null;
  created_at?: string; // timestamptz
}