import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/company-details")({
  head: () => ({
    meta: [
      { title: "Company Details — leaveesy" },
      { name: "description", content: "Tell us about your company." },
    ],
  }),
  component: CompanyDetails,
});

function CompanyDetails() {
  const { company, profile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: company?.company_name || "",
    company_url: company?.company_url || "",
    company_blog_url: company?.blog_url || "",
    company_changelog_url: company?.changelog_url || "",
    company_size: company?.company_size || "",
    company_industry: company?.company_industry || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      console.log("Saving company details for profile:", profile?.id);
      console.log("Form data:", formData);
      console.log("Profile company_id:", profile?.company_id);

      let companyId = profile?.company_id;

      // If no company_id exists, create a new company
      if (!companyId) {
        console.log("No company_id found, creating new company");
        const { data: newCompany, error: createError } = await supabase
          .from("companies")
          .insert({
            company_name: formData.company_name,
            company_url: formData.company_url,
            company_size: formData.company_size,
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating company:", createError);
          toast.error(`Failed to create company: ${createError.message}`);
          throw new Error(createError.message);
        }

        companyId = newCompany.id;
        console.log("New company created with ID:", companyId);

        // Update profile with company_id
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ company_id: companyId })
          .eq("id", profile?.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          toast.error(`Failed to update profile: ${profileError.message}`);
          throw new Error(profileError.message);
        }

        // Create owner role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: profile?.id,
            company_id: companyId,
            role: "owner",
          });

        if (roleError) {
          console.error("Error creating user role:", roleError);
          toast.error(`Failed to create user role: ${roleError.message}`);
          throw new Error(roleError.message);
        }

        // Refresh the auth context to get the updated company_id
        window.location.reload();
      } else {
        // Company exists, update it
        console.log("Updating existing company with ID:", companyId);
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            company_name: formData.company_name,
            company_url: formData.company_url,
            company_size: formData.company_size,
          })
          .eq("id", companyId);

        if (updateError) {
          console.error("Error updating company:", updateError);
          toast.error(`Failed to update company: ${updateError.message}`);
          throw new Error(updateError.message);
        }
      }

      // Mark onboarding as completed in profiles table
      const { error: onboardingError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", profile?.id);

      if (onboardingError) {
        console.error("Error updating onboarding status:", onboardingError);
        console.error("Error details:", JSON.stringify(onboardingError, null, 2));
        // Don't throw on onboarding error, company is saved
      }

      toast.success("Company details saved");

      // Navigate to setup wizard immediately
      navigate({ to: "/setup-wizard", replace: true });

    } catch (error) {
      console.error("Failed to save company details:", error);
      console.error("Full error:", JSON.stringify(error, null, 2));
      toast.error("Failed to save company details. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Tell us about your business</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Help us personalize your leaveesy experience
          </p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>
              Please provide some basic information about your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Acme, Inc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-url">Website URL</Label>
                <Input
                  id="company-url"
                  type="url"
                  value={formData.company_url}
                  onChange={(e) => setFormData({ ...formData, company_url: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-blog-url">Blog URL</Label>
                <Input
                  id="company-blog-url"
                  type="url"
                  value={formData.company_blog_url}
                  onChange={(e) => setFormData({ ...formData, company_blog_url: e.target.value })}
                  placeholder="https://blog.yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-changelog-url">Changelog URL</Label>
                <Input
                  id="company-changelog-url"
                  type="url"
                  value={formData.company_changelog_url}
                  onChange={(e) => setFormData({ ...formData, company_changelog_url: e.target.value })}
                  placeholder="https://yourcompany.com/changelog"
                />
                <p className="text-xs text-muted-foreground">
                  Where you publish product updates and release notes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-size">Company Size</Label>
                <select
                  id="company-size"
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-industry">Industry</Label>
                <Input
                  id="company-industry"
                  value={formData.company_industry}
                  onChange={(e) => setFormData({ ...formData, company_industry: e.target.value })}
                  placeholder="SaaS, E-commerce, etc."
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Continue to Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

