-- Optimize RLS policies to avoid unnecessary re-evaluation of auth.uid()
-- Replaces auth.uid() with (select auth.uid())

-- 1. PROFILES
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id);

-- 2. PROPERTIES
DROP POLICY IF EXISTS "Landlords can insert their own properties" ON public.properties;
CREATE POLICY "Landlords can insert their own properties" ON public.properties
  FOR INSERT WITH CHECK ((select auth.uid()) = landlord_id);

DROP POLICY IF EXISTS "Landlords can update their own properties" ON public.properties;
CREATE POLICY "Landlords can update their own properties" ON public.properties
  FOR UPDATE USING ((select auth.uid()) = landlord_id);

DROP POLICY IF EXISTS "Landlords can delete their own properties" ON public.properties;
CREATE POLICY "Landlords can delete their own properties" ON public.properties
  FOR DELETE USING ((select auth.uid()) = landlord_id);

-- 3. DOCUMENTS
-- Note: Re-creating policies from 12_documents_table.sql with optimization
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING ((select auth.uid()) = user_id);

-- 4. CONTRACTS
DROP POLICY IF EXISTS "Landlords can view their own contracts" ON public.contracts;
CREATE POLICY "Landlords can view their own contracts" ON public.contracts
  FOR SELECT USING ((select auth.uid()) = landlord_id);

DROP POLICY IF EXISTS "Landlords can insert contracts" ON public.contracts;
CREATE POLICY "Landlords can insert contracts" ON public.contracts
  FOR INSERT WITH CHECK ((select auth.uid()) = landlord_id);

DROP POLICY IF EXISTS "Landlords can update their own contracts" ON public.contracts;
CREATE POLICY "Landlords can update their own contracts" ON public.contracts
  FOR UPDATE USING ((select auth.uid()) = landlord_id);

DROP POLICY IF EXISTS "Tenants can view their own contracts" ON public.contracts;
CREATE POLICY "Tenants can view their own contracts" ON public.contracts
  FOR SELECT USING ((select auth.uid()) = tenant_id);

DROP POLICY IF EXISTS "Tenants can update (sign) their own contracts" ON public.contracts;
CREATE POLICY "Tenants can update (sign) their own contracts" ON public.contracts
  FOR UPDATE USING ((select auth.uid()) = tenant_id);

-- 5. PAYMENTS
DROP POLICY IF EXISTS "Tenants can view their own payments" ON public.payments;
CREATE POLICY "Tenants can view their own payments" ON public.payments
  FOR SELECT USING ((select auth.uid()) = tenant_id);

DROP POLICY IF EXISTS "Landlords can view payments for their properties" ON public.payments;
CREATE POLICY "Landlords can view payments for their properties" ON public.payments
  FOR SELECT USING ((select auth.uid()) = landlord_id);

DROP POLICY IF EXISTS "Landlords can insert payments (invoices)" ON public.payments;
CREATE POLICY "Landlords can insert payments (invoices)" ON public.payments
  FOR INSERT WITH CHECK ((select auth.uid()) = landlord_id);

DROP POLICY IF EXISTS "Landlords can update payments" ON public.payments;
CREATE POLICY "Landlords can update payments" ON public.payments
  FOR UPDATE USING ((select auth.uid()) = landlord_id);

-- 6. INCIDENTS
DROP POLICY IF EXISTS "Tenants can view their own incidents" ON public.incidents;
CREATE POLICY "Tenants can view their own incidents" ON public.incidents
  FOR SELECT USING ((select auth.uid()) = tenant_id);

DROP POLICY IF EXISTS "Tenants can create incidents" ON public.incidents;
CREATE POLICY "Tenants can create incidents" ON public.incidents
  FOR INSERT WITH CHECK ((select auth.uid()) = tenant_id);

DROP POLICY IF EXISTS "Landlords can view incidents for their properties" ON public.incidents;
CREATE POLICY "Landlords can view incidents for their properties" ON public.incidents
  FOR SELECT USING (exists (
    select 1 from properties p 
    where p.id = incidents.property_id 
    and p.landlord_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Landlords can update incidents for their properties" ON public.incidents;
CREATE POLICY "Landlords can update incidents for their properties" ON public.incidents
  FOR UPDATE USING (exists (
    select 1 from properties p 
    where p.id = incidents.property_id 
    and p.landlord_id = (select auth.uid())
  ));

-- 7. APPLICATIONS
-- Fix multiple permissive policies by combining them if possible, or just optimize them individually first
-- Optimizing individual policies first to fix the WARN
DROP POLICY IF EXISTS "Tenants can view their own applications" ON public.applications;
CREATE POLICY "Tenants can view their own applications" ON public.applications
  FOR SELECT USING ((select auth.uid()) = tenant_id);

DROP POLICY IF EXISTS "Landlords can view applications for their properties" ON public.applications;
CREATE POLICY "Landlords can view applications for their properties" ON public.applications
  FOR SELECT USING (exists (
    select 1 from properties p 
    where p.id = applications.property_id 
    and p.landlord_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Tenants can insert applications" ON public.applications;
CREATE POLICY "Tenants can insert applications" ON public.applications
  FOR INSERT WITH CHECK ((select auth.uid()) = tenant_id);

DROP POLICY IF EXISTS "Landlords can update application status" ON public.applications;
CREATE POLICY "Landlords can update application status" ON public.applications
  FOR UPDATE USING (exists (
    select 1 from properties p 
    where p.id = applications.property_id 
    and p.landlord_id = (select auth.uid())
  ));

-- 8. MESSAGING (Conversations, Participants, Messages)
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (exists (
    select 1 from conversation_participants cp 
    where cp.conversation_id = conversations.id 
    and cp.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
  FOR SELECT USING (
    user_id = (select auth.uid()) 
    OR exists (
      select 1 from conversation_participants cp 
      where cp.conversation_id = conversation_participants.conversation_id 
      and cp.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (exists (
    select 1 from conversation_participants cp 
    where cp.conversation_id = messages.conversation_id 
    and cp.user_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
CREATE POLICY "Users can insert messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = (select auth.uid())
    AND exists (
      select 1 from conversation_participants cp 
      where cp.conversation_id = messages.conversation_id 
      and cp.user_id = (select auth.uid())
    )
  );
