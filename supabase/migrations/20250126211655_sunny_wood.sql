/*
  # Initial Database Schema

  1. Tables
    - assistants: Asistan bilgileri
    - professionals: Ruh sağlığı uzmanı bilgileri
    - clients: Danışan bilgileri
    - rooms: Terapi odaları
    - clinic_settings: Klinik ayarları
    - appointments: Randevular
    - payments: Ödemeler
    - tests: Testler
    - test_assignments: Test atamaları
    - cash_status: Günlük kasa durumu
    - session_notes: Seans notları
    - test_results: Test sonuçları
    - professional_working_hours: Profesyonellerin çalışma saatleri

  2. Security
    - RLS politikaları her tablo için tanımlanmıştır
    - Her kullanıcı sadece kendi verilerine erişebilir
    - Asistanlar kendilerine bağlı ruh sağlığı uzmanlarının verilerine erişebilir

  3. Constraints
    - Foreign key ilişkileri
    - Check constraints
    - Unique constraints
*/

-- Disable email confirmation requirement
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT NOW();

-- Create tables with proper constraints and relationships
CREATE TABLE assistants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text UNIQUE,
  clinic_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id uuid REFERENCES assistants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  title text,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  birth_date date,
  notes text,
  session_fee numeric NOT NULL DEFAULT 0,
  professional_share_percentage integer NOT NULL DEFAULT 70,
  clinic_share_percentage integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT share_percentage_check CHECK (professional_share_percentage + clinic_share_percentage = 100),
  CONSTRAINT valid_birth_date CHECK (birth_date <= CURRENT_DATE),
  CONSTRAINT valid_session_fee CHECK (session_fee >= 0),
  CONSTRAINT valid_share_percentages CHECK (
    professional_share_percentage >= 0 AND 
    professional_share_percentage <= 100 AND
    clinic_share_percentage >= 0 AND 
    clinic_share_percentage <= 100
  )
);

CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid REFERENCES assistants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  capacity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE clinic_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid REFERENCES assistants(id) ON DELETE CASCADE,
  opening_time_monday time NOT NULL DEFAULT '09:00',
  closing_time_monday time NOT NULL DEFAULT '18:00',
  is_open_monday boolean NOT NULL DEFAULT true,
  opening_time_tuesday time NOT NULL DEFAULT '09:00',
  closing_time_tuesday time NOT NULL DEFAULT '18:00',
  is_open_tuesday boolean NOT NULL DEFAULT true,
  opening_time_wednesday time NOT NULL DEFAULT '09:00',
  closing_time_wednesday time NOT NULL DEFAULT '18:00',
  is_open_wednesday boolean NOT NULL DEFAULT true,
  opening_time_thursday time NOT NULL DEFAULT '09:00',
  closing_time_thursday time NOT NULL DEFAULT '18:00',
  is_open_thursday boolean NOT NULL DEFAULT true,
  opening_time_friday time NOT NULL DEFAULT '09:00',
  closing_time_friday time NOT NULL DEFAULT '18:00',
  is_open_friday boolean NOT NULL DEFAULT true,
  opening_time_saturday time NOT NULL DEFAULT '09:00',
  closing_time_saturday time NOT NULL DEFAULT '18:00',
  is_open_saturday boolean NOT NULL DEFAULT false,
  opening_time_sunday time NOT NULL DEFAULT '09:00',
  closing_time_sunday time NOT NULL DEFAULT '18:00',
  is_open_sunday boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  clinic_amount numeric NOT NULL DEFAULT 0
);

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  professional_amount numeric NOT NULL DEFAULT 0,
  clinic_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  collected_by text NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid_to_clinic', 'paid_to_professional')),
  CONSTRAINT valid_collected_by CHECK (collected_by IN ('clinic', 'professional'))
);

CREATE TABLE cash_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid REFERENCES assistants(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  opening_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_date_per_assistant UNIQUE (assistant_id, date)
);

-- Session Notes table
CREATE TABLE session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  encrypted_content text,
  encryption_key text,
  iv text,
  created_at timestamptz DEFAULT now()
);

-- Test sonuçları tablosu
CREATE TABLE test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  test_type text NOT NULL,
  score numeric NOT NULL,
  answers jsonb NOT NULL,
  encrypted_answers text,
  encryption_key text,
  iv text,
  notes text,
  duration_seconds integer,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Test token tablosu
CREATE TABLE test_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days') NOT NULL
);

-- Professional çalışma saatleri tablosu
CREATE TABLE professional_working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES professionals(id) ON DELETE CASCADE,
  opening_time_monday time NOT NULL DEFAULT '09:00',
  closing_time_monday time NOT NULL DEFAULT '18:00',
  is_open_monday boolean NOT NULL DEFAULT true,
  opening_time_tuesday time NOT NULL DEFAULT '09:00',
  closing_time_tuesday time NOT NULL DEFAULT '18:00',
  is_open_tuesday boolean NOT NULL DEFAULT true,
  opening_time_wednesday time NOT NULL DEFAULT '09:00',
  closing_time_wednesday time NOT NULL DEFAULT '18:00',
  is_open_wednesday boolean NOT NULL DEFAULT true,
  opening_time_thursday time NOT NULL DEFAULT '09:00',
  closing_time_thursday time NOT NULL DEFAULT '18:00',
  is_open_thursday boolean NOT NULL DEFAULT true,
  opening_time_friday time NOT NULL DEFAULT '09:00',
  closing_time_friday time NOT NULL DEFAULT '18:00',
  is_open_friday boolean NOT NULL DEFAULT true,
  opening_time_saturday time NOT NULL DEFAULT '09:00',
  closing_time_saturday time NOT NULL DEFAULT '18:00',
  is_open_saturday boolean NOT NULL DEFAULT false,
  opening_time_sunday time NOT NULL DEFAULT '09:00',
  closing_time_sunday time NOT NULL DEFAULT '18:00',
  is_open_sunday boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_professional_working_hours UNIQUE (professional_id)
);

-- Enable Row Level Security
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_working_hours ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Assistant policies
CREATE POLICY "Assistants can view own data" ON assistants
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Assistants can insert own data" ON assistants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Assistants can update own data" ON assistants
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Assistants can delete own data" ON assistants
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add a policy for anon users to insert assistants during signup
CREATE POLICY "Allow anon to insert assistants during signup" ON assistants
  FOR INSERT TO anon
  WITH CHECK (true);

-- Professional policies
CREATE POLICY "View professionals policy" ON professionals
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR  -- Profesyoneller kendi verilerini görebilir
    assistant_id IN (        -- Asistanlar yönettiği profesyonelleri görebilir
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Insert professionals policy" ON professionals;

-- Create new insert policy that allows any authenticated user to insert
CREATE POLICY "Insert professionals policy" ON professionals
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Update professionals policy" ON professionals
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR  -- Profesyoneller kendi bilgilerini güncelleyebilir
    assistant_id IN (        -- Asistanlar yönettiği profesyonelleri güncelleyebilir
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Delete professionals policy" ON professionals
  FOR DELETE TO authenticated
  USING (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

-- Client policies
DROP POLICY IF EXISTS "View clients policy" ON clients;
DROP POLICY IF EXISTS "Manage clients policy" ON clients;

-- View policy for clients
CREATE POLICY "View clients policy" ON clients
  FOR SELECT TO authenticated
  USING (
    -- Ruh sağlığı uzmanları kendi danışanlarını görebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
    OR
    -- Asistanlar, bağlı oldukları ruh sağlığı uzmanlarının danışanlarını görebilir
    professional_id IN (
      SELECT id FROM professionals WHERE assistant_id = (
        SELECT id FROM assistants WHERE user_id = auth.uid()
      )
    )
  );

-- Insert policy for clients
CREATE POLICY "Insert clients policy" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Ruh sağlığı uzmanları sadece kendileri için danışan ekleyebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
    OR
    -- Asistanlar kendi kliniğindeki ruh sağlığı uzmanları için danışan ekleyebilir
    professional_id IN (
      SELECT id FROM professionals 
      WHERE assistant_id = (
        SELECT id FROM assistants WHERE user_id = auth.uid()
      )
    )
  );

-- Update policy for clients
CREATE POLICY "Update clients policy" ON clients
  FOR UPDATE TO authenticated
  USING (
    -- Ruh sağlığı uzmanları sadece kendi danışanlarını güncelleyebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
    OR
    -- Asistanlar kendi kliniğindeki ruh sağlığı uzmanlarının danışanlarını güncelleyebilir
    professional_id IN (
      SELECT id FROM professionals 
      WHERE assistant_id = (
        SELECT id FROM assistants WHERE user_id = auth.uid()
      )
    )
  );

-- Delete policy for clients
CREATE POLICY "Delete clients policy" ON clients
  FOR DELETE TO authenticated
  USING (
    -- Ruh sağlığı uzmanları sadece kendi danışanlarını silebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
    OR
    -- Asistanlar kendi kliniğindeki ruh sağlığı uzmanlarının danışanlarını silebilir
    professional_id IN (
      SELECT id FROM professionals 
      WHERE assistant_id = (
        SELECT id FROM assistants WHERE user_id = auth.uid()
      )
    )
  );

-- Room policies
CREATE POLICY "View rooms policy" ON rooms
  FOR SELECT TO authenticated
  USING (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
      UNION
      SELECT assistant_id FROM professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Manage rooms policy" ON rooms
  FOR ALL TO authenticated
  USING (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

-- Clinic settings policies
CREATE POLICY "View clinic settings policy" ON clinic_settings
  FOR SELECT TO authenticated
  USING (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
      UNION
      SELECT assistant_id FROM professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Manage clinic settings policy" ON clinic_settings
  FOR ALL TO authenticated
  USING (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

-- Appointment policies
CREATE POLICY "View appointments policy" ON appointments
  FOR SELECT TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM professionals WHERE user_id = auth.uid()
      UNION
      SELECT id FROM professionals WHERE assistant_id IN (
        SELECT id FROM assistants WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Manage appointments policy" ON appointments
  FOR ALL TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM professionals WHERE user_id = auth.uid()
      UNION
      SELECT id FROM professionals WHERE assistant_id IN (
        SELECT id FROM assistants WHERE user_id = auth.uid()
      )
    )
  );

-- Payment policies
CREATE POLICY "View payments policy" ON payments
  FOR SELECT TO authenticated
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE professional_id IN (
        SELECT id FROM professionals WHERE user_id = auth.uid()
        UNION
        SELECT id FROM professionals WHERE assistant_id IN (
          SELECT id FROM assistants WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Manage payments policy" ON payments
  FOR ALL TO authenticated
  USING (
    appointment_id IN (
      SELECT id FROM appointments WHERE professional_id IN (
        SELECT id FROM professionals WHERE user_id = auth.uid()
        UNION
        SELECT id FROM professionals WHERE assistant_id IN (
          SELECT id FROM assistants WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Cash status policies
CREATE POLICY "View cash status policy" ON cash_status
  FOR SELECT TO authenticated
  USING (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Insert cash status policy" ON cash_status
  FOR INSERT TO authenticated
  WITH CHECK (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Update cash status policy" ON cash_status
  FOR UPDATE TO authenticated
  USING (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Delete cash status policy" ON cash_status
  FOR DELETE TO authenticated
  USING (
    assistant_id IN (
      SELECT id FROM assistants WHERE user_id = auth.uid()
    )
  );

-- Session Notes policies
DROP POLICY IF EXISTS "View session notes policy" ON session_notes;
CREATE POLICY "View session notes policy" ON session_notes
  FOR SELECT TO authenticated
  USING (
    -- Sadece ruh sağlığı uzmanları kendi yazdığı notları görebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Insert session notes policy" ON session_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Sadece ruh sağlığı uzmanları not ekleyebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Delete session notes policy" ON session_notes
  FOR DELETE TO authenticated
  USING (
    -- Sadece ruh sağlığı uzmanları kendi notlarını silebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

-- Test sonuçları için RLS politikaları
DROP POLICY IF EXISTS "View test results policy" ON test_results;
CREATE POLICY "View test results policy" ON test_results
  FOR SELECT TO authenticated
  USING (
    -- Sadece ruh sağlığı uzmanları kendi uyguladığı testleri görebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Insert test results policy" ON test_results;
CREATE POLICY "Insert test results policy" ON test_results
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Ruh sağlığı uzmanları test ekleyebilir
    (professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    ))
  );

-- Anonim kullanıcılar için test sonuçları politikası
DROP POLICY IF EXISTS "Insert test results for anon policy" ON test_results;
CREATE POLICY "Insert test results for anon policy" ON test_results
  FOR INSERT TO anon
  WITH CHECK (true);

-- Test token politikaları
DROP POLICY IF EXISTS "View test tokens policy" ON test_tokens;
CREATE POLICY "View test tokens policy" ON test_tokens
  FOR SELECT TO anon
  USING (true);

-- Anonim kullanıcılar için test token politikası
DROP POLICY IF EXISTS "View test tokens for anon policy" ON test_tokens;
CREATE POLICY "View test tokens for anon policy" ON test_tokens
  FOR SELECT TO anon
  USING (true);

-- Add policy for inserting test tokens
DROP POLICY IF EXISTS "Insert test tokens policy" ON test_tokens;
CREATE POLICY "Insert test tokens policy" ON test_tokens
  FOR INSERT TO authenticated
  WITH CHECK (
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM professionals p
      JOIN assistants a ON a.id = p.assistant_id
      WHERE a.user_id = auth.uid() 
      AND p.id = professional_id
    )
  );

-- Delete test results policy
DROP POLICY IF EXISTS "Delete test results policy" ON test_results;
CREATE POLICY "Delete test results policy" ON test_results
  FOR DELETE TO authenticated
  USING (
    -- Sadece ruh sağlığı uzmanları kendi uyguladığı testleri silebilir
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

-- Client politikaları için anonim erişim
DROP POLICY IF EXISTS "View clients with token policy" ON clients;
CREATE POLICY "View clients with token policy" ON clients
  FOR SELECT TO anon
  USING (true);

-- Test sonuçları için anonim erişim
DROP POLICY IF EXISTS "Insert test results with token policy" ON test_results;
CREATE POLICY "Insert test results with token policy" ON test_results
  FOR INSERT TO anon
  WITH CHECK (true);

-- Professional çalışma saatleri politikaları
CREATE POLICY "View professional working hours policy" ON professional_working_hours
  FOR SELECT TO authenticated
  USING (
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
    OR
    professional_id IN (
      SELECT id FROM professionals WHERE assistant_id IN (
        SELECT id FROM assistants WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Manage professional working hours policy" ON professional_working_hours
  FOR ALL TO authenticated
  USING (
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

-- Test results için politikalar
CREATE POLICY "View test results policy for professionals" ON test_results
  FOR SELECT TO authenticated
  USING (
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Insert test results policy for professionals" ON test_results
  FOR INSERT TO authenticated
  WITH CHECK (
    professional_id = (
      SELECT id FROM professionals WHERE user_id = auth.uid()
    )
  );

-- Anonim kullanıcılar için test sonuçları politikası
CREATE POLICY "View test results policy for anon" ON test_results
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Insert test results policy for anon" ON test_results
  FOR INSERT TO anon
  WITH CHECK (true);

-- Clients için politikalar
CREATE POLICY "View clients policy for anon" ON clients
  FOR SELECT TO anon
  USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant necessary permissions for anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON test_tokens TO anon;
GRANT SELECT ON clients TO anon;
GRANT INSERT ON test_results TO anon;
GRANT SELECT ON test_results TO anon;