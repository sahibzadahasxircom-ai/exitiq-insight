import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const CompanySchema = z.object({
  company_name: z.string().min(1),
  company_url: z.string().url().optional(),
  company_blog_url: z.string().url().optional(),
  company_changelog_url: z.string().url().optional(),
  company_size: z.string().optional(),
  company_industry: z.string().optional(),
});

export type CompanyInput = z.infer<typeof CompanySchema>;

export const createCompanyFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CompanySchema.parse(d))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if a company with this name already exists
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id, company_name")
      .eq("company_name", data.company_name)
      .maybeSingle();

    if (existingCompany) {
      console.log("Company with this name already exists, returning existing company:", existingCompany);
      return existingCompany;
    }

    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        company_name: data.company_name,
        company_url: data.company_url,
        company_size: data.company_size,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", error);
      throw new Error(`Failed to create company: ${error.message}`);
    }

    return company;
  });

export const updateCompanyFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    companyId: z.string().uuid(),
    data: CompanySchema,
  }).parse(d))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("companies")
      .update({
        company_name: data.data.company_name,
        company_url: data.data.company_url,
        company_size: data.data.company_size,
      })
      .eq("id", data.companyId);

    if (error) {
      console.error("Error updating company:", error);
      throw new Error(`Failed to update company: ${error.message}`);
    }

    return { success: true };
  });

export const linkUserToCompanyFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    userId: z.string().uuid(),
    companyId: z.string().uuid(),
  }).parse(d))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update profile with company_id
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ company_id: data.companyId })
      .eq("id", data.userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    // Create owner role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: data.userId,
        company_id: data.companyId,
        role: "owner",
      });

    if (roleError) {
      console.error("Error creating user role:", roleError);
      throw new Error(`Failed to create user role: ${roleError.message}`);
    }

    return { success: true };
  });
