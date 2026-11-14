import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — leaveesy" },
      { name: "description", content: "Customize your workspace branding and templates." },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { company } = useAuth();
  console.log("Workspace component mounted, company:", company);
  
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [companyName, setCompanyName] = useState(company?.company_name || "");
  
  // Ensure company name is always synced with the loaded company data
  useEffect(() => {
    if (company?.company_name) {
      setCompanyName(company.company_name);
    }
  }, [company?.company_name]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-Form Customization State
  const [preFormStyle, setPreFormStyle] = useState("professional");
  const [preFormTitle, setPreFormTitle] = useState("We're sorry to see you go");
  const [preFormDescription, setPreFormDescription] = useState("Help us improve by sharing your feedback");
  const [backgroundStyle, setBackgroundStyle] = useState("gradient");
  const [buttonColor, setButtonColor] = useState(brandColor);
  const [buttonTextColor, setButtonTextColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [solidBackgroundColor, setSolidBackgroundColor] = useState("");
  const [requireName, setRequireName] = useState(true);
  const [requireEmail, setRequireEmail] = useState(true);
  const [showNameField, setShowNameField] = useState(true);
  const [showEmailField, setShowEmailField] = useState(true);

  console.log("Background style state:", backgroundStyle);

  // Load existing company pre-form settings
  useEffect(() => {
    if (company?.id) {
      const loadCompanySettings = async () => {
        const { data } = await supabase
          .from("companies")
          .select("pre_form_style, pre_form_title, pre_form_description, brand_color, company_logo, company_name, background_style, button_color, button_text_color, text_color, solid_background_color, require_name, require_email, show_name_field, show_email_field")
          .eq("id", company.id)
          .single();

        if (data) {
          if (data.pre_form_style) setPreFormStyle(data.pre_form_style);
          if (data.pre_form_title) setPreFormTitle(data.pre_form_title);
          if (data.pre_form_description) setPreFormDescription(data.pre_form_description);
          if (data.brand_color) setBrandColor(data.brand_color);
          if (data.company_logo) setLogo(data.company_logo);
          if (data.company_name) setCompanyName(data.company_name);
          if (data.background_style) setBackgroundStyle(data.background_style);
          if (data.button_color) setButtonColor(data.button_color);
          if (data.button_text_color) setButtonTextColor(data.button_text_color);
          if (data.text_color) setTextColor(data.text_color);
          if (data.solid_background_color) setSolidBackgroundColor(data.solid_background_color);
          if (data.require_name !== undefined) setRequireName(data.require_name);
          if (data.require_email !== undefined) setRequireEmail(data.require_email);
          if (data.show_name_field !== undefined) setShowNameField(data.show_name_field);
          if (data.show_email_field !== undefined) setShowEmailField(data.show_email_field);
        }
      };
      loadCompanySettings();
    }
  }, [company?.id]);

  // Interview Page Design State

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!company?.id) return;

    setSaving(true);
    try {
      console.log("Saving branding for company:", company.id);
      console.log("Company name:", companyName);
      console.log("Brand color:", brandColor);
      console.log("Logo file:", logoFile);
      console.log("Current logo URL:", logo);

      let logoUrl = logo;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${company.id}-${Date.now()}.${fileExt}`;
        console.log("Uploading logo:", fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, logoFile);

        if (uploadError) {
          console.error("Logo upload error:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
        console.log("Logo uploaded successfully:", logoUrl);
      }

      console.log("Updating company record...");
      const { error } = await (supabase as any)
        .from("companies")
        .update({
          brand_color: brandColor,
          company_logo: logoUrl,
          company_name: companyName,
          background_style: backgroundStyle,
        })
        .eq("id", company.id);

      if (error) {
        console.error("Database update error:", error);
        throw error;
      }

      console.log("Branding saved successfully");
      toast.success("Branding saved successfully");
    } catch (error) {
      console.error("Failed to save branding:", error);
      toast.error("Failed to save branding. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreForm = async () => {
    if (!company?.id) return;

    setSaving(true);
    try {
      // Build update object dynamically based on what fields exist
      const updateData: any = {
        pre_form_style: preFormStyle,
        pre_form_title: preFormTitle,
        pre_form_description: preFormDescription,
        background_style: backgroundStyle,
        button_color: buttonColor,
        button_text_color: buttonTextColor,
        text_color: textColor,
        solid_background_color: solidBackgroundColor,
        require_name: requireName,
        require_email: requireEmail,
        show_name_field: showNameField,
        show_email_field: showEmailField,
      };

      const { error } = await (supabase as any)
        .from("companies")
        .update(updateData)
        .eq("id", company.id);

      if (error) {
        console.error("Failed to save pre-form settings:", error);
        throw error;
      }

      console.log("Pre-form settings saved successfully");
      toast.success("Pre-form settings saved successfully");
    } catch (error) {
      console.error("Failed to save pre-form settings:", error);
      toast.error("Failed to save pre-form settings. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const preFormTemplates = [
    {
      id: "professional",
      name: "Professional",
      description: "Enterprise-grade design",
      preview: "Clean, structured layout with standard spacing and typography",
    },
    {
      id: "casual",
      name: "Casual",
      description: "Friendly and approachable",
      preview: "Rounded corners, larger elements, softer feel",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean and distraction-free",
      preview: "Minimal borders, centered content, essential elements only",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Workspace</h1>
        <p className="text-gray-500 mt-2">
          Customize your workspace branding and customer experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Preview */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>
            <div
              className="mx-auto border rounded-xl overflow-hidden relative max-w-lg"
              style={{ backgroundColor: solidBackgroundColor || (backgroundStyle === "none" ? "transparent" : "white") }}
            >
              {/* Background effect */}
              {backgroundStyle === "mesh" && (
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(at 40% 20%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 80% 0%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 0% 50%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 80% 50%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 0% 100%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 80% 100%, ${brandColor} 0px, transparent 50%)
                    `
                  }}
                />
              )}
              {backgroundStyle === "aurora" && (
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(135deg, ${brandColor} 0%, transparent 50%),
                      linear-gradient(225deg, ${brandColor} 0%, transparent 50%),
                      linear-gradient(45deg, ${brandColor} 0%, transparent 50%)
                    `
                  }}
                />
              )}
              {backgroundStyle === "dots" && (
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle, ${brandColor} 2px, transparent 2px)`,
                    backgroundSize: '30px 30px'
                  }}
                />
              )}
              {backgroundStyle === "layers" && (
                <>
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, ${brandColor} 0%, transparent 100%)`
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, ${brandColor} 100%)`
                    }}
                  />
                </>
              )}
              {backgroundStyle === "gradient" && (
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 20% 20%, ${brandColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${brandColor} 0%, transparent 50%)`
                  }}
                />
              )}

              {/* Logo and Company Name */}
              {(logoPreview || logo || companyName) && (
                <div className={`absolute top-4 left-4 flex items-center gap-2 z-20 ${
                  preFormStyle === "minimal" ? "hidden" : ""
                }`}>
                  {(logoPreview || logo) && (
                    <img src={logoPreview || logo} alt="Logo" className="h-8 w-8 object-contain flex-shrink-0 rounded-lg" />
                  )}
                  {companyName && (
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold" style={{ color: textColor }}>
                        {companyName}
                      </span>
                      <span className="text-[10px] text-gray-500">Exit Interview</span>
                    </div>
                  )}
                </div>
              )}

              <div className={`p-8 pt-20 space-y-6 relative z-10 ${
                preFormStyle === "minimal" ? "text-center" : ""
              }`} style={{ color: textColor }}>
                <div className={`space-y-1 ${
                  preFormStyle === "minimal" ? "text-center" : ""
                }`}>
                  <h3 className={`${
                    preFormStyle === "casual" ? "text-2xl font-semibold" :
                    preFormStyle === "minimal" ? "text-xl font-medium" : "text-xl font-bold"
                  } tracking-tight`} style={{ color: textColor }}>
                    {preFormTitle}
                  </h3>
                  <p className={`${
                    preFormStyle === "casual" ? "text-base" :
                    preFormStyle === "minimal" ? "text-sm" : "text-sm"
                  }`} style={{ color: textColor, opacity: 0.8 }}>
                    {preFormDescription}
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-3">
                  {showNameField && (
                    <div className="space-y-1">
                      <Label className="text-xs" style={{ color: textColor }}>
                        Your name{requireName ? " *" : " (optional)"}
                      </Label>
                      <Input 
                        placeholder="John Doe"
                        disabled
                        className={preFormStyle === "minimal" ? "border-b rounded-none px-0" : ""}
                      />
                    </div>
                  )}
                  {showEmailField && (
                    <div className="space-y-1">
                      <Label className="text-xs" style={{ color: textColor }}>
                        Your email{requireEmail ? " *" : " (optional)"}
                      </Label>
                      <Input 
                        type="email"
                        placeholder="john@example.com"
                        disabled
                        className={preFormStyle === "minimal" ? "border-b rounded-none px-0" : ""}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      preFormStyle === "casual" ? "rounded-xl" :
                      preFormStyle === "minimal" ? "rounded-md" : "rounded-lg"
                    }`}
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                  >
                    Start Conversation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          {/* Brand Identity */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Brand Identity</h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-sm font-medium">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-upload" className="text-sm font-medium">Company Logo</Label>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-10 text-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, or SVG up to 2MB
                    </p>
                  </div>
                  {(logoPreview || logo) && (
                    <div className="h-12 w-12 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={logoPreview || logo}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-color" className="text-sm font-medium">Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="brand-color"
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1 h-10 text-sm"
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full h-10">
                {saving ? "Saving..." : "Save Branding"}
              </Button>
            </div>
          </div>

          {/* Pre-Form Settings */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pre-Form Settings</h2>
            
            <div className="space-y-5">
              {/* Form Style */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Form Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {preFormTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setPreFormStyle(template.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        preFormStyle === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Effect */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Background Effect</Label>
                <Select value={backgroundStyle} onValueChange={(value) => {
                  setBackgroundStyle(value);
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select background effect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="mesh">Mesh Gradient</SelectItem>
                    <SelectItem value="aurora">Aurora</SelectItem>
                    <SelectItem value="dots">Dots Pattern</SelectItem>
                    <SelectItem value="layers">Layers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Customization */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pre-form-title" className="text-sm font-medium mb-2 block">
                    Form Title
                  </Label>
                  <Input
                    id="pre-form-title"
                    value={preFormTitle}
                    onChange={(e) => setPreFormTitle(e.target.value)}
                    placeholder="We're sorry to see you go"
                    className="text-sm h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="pre-form-description" className="text-sm font-medium mb-2 block">
                    Form Description
                  </Label>
                  <Textarea
                    id="pre-form-description"
                    value={preFormDescription}
                    onChange={(e) => setPreFormDescription(e.target.value)}
                    placeholder="Help us improve by sharing your feedback"
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Button Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={buttonColor}
                      onChange={(e) => setButtonColor(e.target.value)}
                      placeholder="#2563eb"
                      className="flex-1 h-10 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Button Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 h-10 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 h-10 text-sm"
                  />
                </div>
              </div>

              <Button onClick={handleSavePreForm} disabled={saving} className="w-full h-10">
                {saving ? "Saving..." : "Save Pre-Form Settings"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

