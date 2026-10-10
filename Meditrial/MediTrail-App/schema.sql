-- Supabase PostgreSQL Schema for MediTrail

-- Users table is managed by Supabase Auth (auth.users)
-- We extend it with profile tables

CREATE TABLE public.patient_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    blood_group TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.doctor_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    specialty TEXT,
    hospital_name TEXT,
    professional_designation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patient_profiles(id) NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Path in Supabase Storage
    content_type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patient_profiles(id) NOT NULL,
    document_id UUID REFERENCES public.medical_documents(id),
    record_type TEXT NOT NULL, -- 'Diagnosis', 'Prescription', 'LabTest', 'Visit'
    record_date DATE,
    provider_name TEXT,
    summary TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patient_profiles(id) NOT NULL,
    record_id UUID REFERENCES public.medical_records(id),
    name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    is_current BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patient_profiles(id) NOT NULL,
    allergen TEXT NOT NULL,
    severity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.sharing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patient_profiles(id) NOT NULL,
    doctor_email TEXT, -- Can be null if generic link
    sharing_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    permissions JSONB NOT NULL DEFAULT '{"timeline": true, "snapshot": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.access_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sharing_sessions(id),
    patient_id UUID REFERENCES public.patient_profiles(id) NOT NULL,
    accessed_by TEXT, -- IP or Doctor ID
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Patients can only read/write their own records
CREATE POLICY "Patients can view own profile" 
    ON public.patient_profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Patients can view own records" 
    ON public.medical_records FOR SELECT 
    USING (auth.uid() = patient_id);
    
-- Note: Further complex RLS policies would be added for Doctors accessing shared sessions.
