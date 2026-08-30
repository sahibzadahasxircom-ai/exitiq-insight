-- Add INSERT policy for companies table to allow users to create companies
-- This is needed for the company-details page when company_id is null
-- Run this in Supabase Dashboard → SQL Editor

-- First, drop any existing policy with this name
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;

-- Create a policy that allows authenticated users to insert companies
-- This is needed for new user signup and company creation
CREATE POLICY "Users can create companies" ON public.companies 
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Also add a policy to allow users to insert companies when they don't have one yet
DROP POLICY IF EXISTS "Users can create company if none exists" ON public.companies;

CREATE POLICY "Users can create company if none exists" ON public.companies 
  FOR INSERT TO authenticated 
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );
