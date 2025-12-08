-- Add indexes to foreign keys to improve query performance and resolve Supabase Performance Advisor suggestions

-- 1. DOCUMENTS TABLE
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON public.documents(property_id);

-- 2. INCIDENTS TABLE
CREATE INDEX IF NOT EXISTS idx_incidents_tenant_id ON public.incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_property_id ON public.incidents(property_id);

-- 3. PAYMENTS TABLE
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_landlord_id ON public.payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);

-- 4. CONTRACTS TABLE
CREATE INDEX IF NOT EXISTS idx_contracts_application_id ON public.contracts(application_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord_id ON public.contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property_id ON public.contracts(property_id);

-- 5. APPLICATIONS TABLE (Assuming table exists from previous migrations, explicitly indexing FKs)
-- Note: applications table creation wasn't in the viewed files but referenced in contracts. 
-- Adding safe checks.
CREATE INDEX IF NOT EXISTS idx_applications_property_id ON public.applications(property_id);
CREATE INDEX IF NOT EXISTS idx_applications_tenant_id ON public.applications(tenant_id);

-- 6. PROPERTIES TABLE
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON public.properties(landlord_id);

-- 7. MESSAGING (Conversations, Participants, Messages)
-- Assuming these tables exist as referenced in RLS policies
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- 8. PROFILES
-- id is primary key, so indexed. email is usually indexed by auth but good to ensure if queried often.
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
