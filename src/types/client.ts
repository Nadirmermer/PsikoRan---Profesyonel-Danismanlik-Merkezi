export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  notes?: string;
  session_fee: number;
  professional_share_percentage: number;
  clinic_share_percentage: number;
  professional_id: string;
  professional?: {
    id: string;
    full_name: string;
    title?: string;
    email: string;
    phone?: string;
    clinic_name?: string;
    assistant_id?: string;
    user_id?: string;
  };
} 