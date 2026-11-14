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
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Workspace</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Customize your brand and interview experience
        </p>
      </div>

      <div className="space-y-8">
        {/* Brand Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Brand</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  className="h-11 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                <div className="flex gap-3">
                  <div
                    className="w-12 h-11 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden"
                    onClick={() => document.getElementById('brand-color-picker')?.click()}
                    style={{ backgroundColor: brandColor }}
                  />
                  <Input
                    id="brand-color-picker"
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-20 h-11 p-1 hidden"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1 h-11 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 px-6"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  {(logoPreview || logo) && (
                    <div className="h-11 w-11 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={logoPreview || logo}
                        alt="Logo preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full h-11 text-base">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8">
              <div className="text-center">
                {(logoPreview || logo) && (
                  <img
                    src={logoPreview || logo}
                    alt="Logo"
                    className="h-16 w-auto mx-auto mb-4 object-contain"
                  />
                )}
                <h3 className="text-2xl font-bold" style={{ color: brandColor }}>
                  {companyName || "Your Company"}
                </h3>
                <p className="text-gray-500 mt-1">Exit Interview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Form Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Interview Form</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Style</label>
              <div className="grid grid-cols-3 gap-4">
                {preFormTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPreFormStyle(template.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      preFormStyle === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-base mb-1">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={preFormTitle}
                  onChange={(e) => setPreFormTitle(e.target.value)}
                  placeholder="We're sorry to see you go"
                  className="h-11 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Input
                  value={preFormDescription}
                  onChange={(e) => setPreFormDescription(e.target.value)}
                  placeholder="Help us improve by sharing your feedback"
                  className="h-11 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Background</label>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { id: "gradient", name: "Gradient" },
                  { id: "mesh", name: "Mesh" },
                  { id: "aurora", name: "Aurora" },
                  { id: "dots", name: "Dots" },
                  { id: "layers", name: "Layers" },
                ].map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setBackgroundStyle(effect.id)}
                    className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                      backgroundStyle === effect.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {effect.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                    onClick={() => document.getElementById('button-color-picker')?.click()}
                    style={{ backgroundColor: buttonColor }}
                  />
                  <Input
                    id="button-color-picker"
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-16 h-10 p-1 hidden"
                  />
                  <Input
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="flex-1 h-10 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                    onClick={() => document.getElementById('button-text-color-picker')?.click()}
                    style={{ backgroundColor: buttonTextColor }}
                  />
                  <Input
                    id="button-text-color-picker"
                    type="color"
                    value={buttonTextColor}
                    onChange={(e) => setButtonTextColor(e.target.value)}
                    className="w-16 h-10 p-1 hidden"
                  />
                  <Input
                    value={buttonTextColor}
                    onChange={(e) => setButtonTextColor(e.target.value)}
                    className="flex-1 h-10 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer"
                    onClick={() => document.getElementById('text-color-picker')?.click()}
                    style={{ backgroundColor: textColor }}
                  />
                  <Input
                    id="text-color-picker"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-10 p-1 hidden"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSavePreForm} disabled={saving} className="w-full h-11 text-base">
              {saving ? "Saving..." : "Save Interview Form"}
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gray-900 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Preview</h2>
          <div
            className="mx-auto max-w-lg rounded-2xl overflow-hidden relative border border-gray-700"
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
              <div className={`absolute top-6 left-6 flex items-center gap-3 z-20 ${
                preFormStyle === "minimal" ? "hidden" : ""
              }`}>
                {(logoPreview || logo) && (
                  <img src={logoPreview || logo} alt="Logo" className="h-10 w-10 object-contain flex-shrink-0 rounded-lg" />
                )}
                {companyName && (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold" style={{ color: textColor }}>
                      {companyName}
                    </span>
                    <span className="text-xs text-gray-500">Exit Interview</span>
                  </div>
                )}
              </div>
            )}

            <div className={`p-8 pt-24 space-y-6 relative z-10 ${
              preFormStyle === "minimal" ? "text-center" : ""
            }`} style={{ color: textColor }}>
              <div className={`space-y-2 ${
                preFormStyle === "minimal" ? "text-center" : ""
              }`}>
                <h3 className={`${
                  preFormStyle === "casual" ? "text-2xl font-semibold" :
                  preFormStyle === "minimal" ? "text-xl font-medium" : "text-2xl font-bold"
                } tracking-tight`} style={{ color: textColor }}>
                  {preFormTitle}
                </h3>
                <p className={`${
                  preFormStyle === "casual" ? "text-base" :
                  preFormStyle === "minimal" ? "text-sm" : "text-base"
                }`} style={{ color: textColor, opacity: 0.8 }}>
                  {preFormDescription}
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {showNameField && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: textColor }}>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: textColor }}>
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
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                    preFormStyle === "casual" ? "rounded-2xl" :
                    preFormStyle === "minimal" ? "rounded-lg" : "rounded-xl"
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
    </div>
  );
}

