import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Monitor, Tablet, Smartphone, Palette, Type, Image, Layout, Save, Eye, Upload, MessageSquare } from "lucide-react";

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
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [companyName, setCompanyName] = useState(company?.company_name || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Customer Experience Builder State
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [experienceConfig, setExperienceConfig] = useState({
    headline: "Your subscription has been cancelled",
    description: "We're sorry to see you go. Before you leave, could you help us understand why? This takes about 2 minutes and helps us improve our product for everyone.",
    ctaText: "Let's Continue",
    skipText: "Skip Interview",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    buttonColor: "#2563eb",
    buttonTextColor: "#ffffff",
    fontFamily: "Inter",
    showLogo: true,
    showIllustration: true,
    gradientEnabled: false,
    gradientFrom: "#2563eb",
    gradientTo: "#7c3aed",
  });

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
      let logoUrl = logo;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${company.id}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      const { error } = await (supabase as any)
        .from("companies")
        .update({
          brand_color: brandColor,
          company_logo: logoUrl,
        })
        .eq("id", company.id);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to save branding:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExperience = async () => {
    if (!company?.id) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("companies")
        .update({
          customer_experience_config: experienceConfig,
        })
        .eq("id", company.id);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to save experience config:", error);
    } finally {
      setSaving(false);
    }
  };

  const templates = [
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean and simple design",
      config: {
        headline: "Your subscription has been cancelled",
        description: "We're sorry to see you go. Before you leave, could you help us understand why? This takes about 2 minutes.",
        ctaText: "Let's Continue",
        skipText: "Skip Interview",
        backgroundColor: "#ffffff",
        textColor: "#0f172a",
        buttonColor: "#2563eb",
        buttonTextColor: "#ffffff",
        fontFamily: "Inter",
        showLogo: true,
        showIllustration: false,
        gradientEnabled: false,
        gradientFrom: "#2563eb",
        gradientTo: "#7c3aed",
      },
    },
    {
      id: "modern",
      name: "Modern Gradient",
      description: "Contemporary with vibrant gradients",
      config: {
        headline: "We'll miss you",
        description: "Your feedback helps us build better products. Share your thoughts in a quick 2-minute interview.",
        ctaText: "Start Interview",
        skipText: "No thanks",
        backgroundColor: "#f8fafc",
        textColor: "#1e293b",
        buttonColor: "#7c3aed",
        buttonTextColor: "#ffffff",
        fontFamily: "Inter",
        showLogo: true,
        showIllustration: true,
        gradientEnabled: true,
        gradientFrom: "#7c3aed",
        gradientTo: "#2563eb",
      },
    },
    {
      id: "professional",
      name: "Professional",
      description: "Enterprise-focused design",
      config: {
        headline: "Cancellation Confirmation",
        description: "Thank you for your business. Your feedback is valuable to us. Please take 2 minutes to share your experience.",
        ctaText: "Provide Feedback",
        skipText: "Continue to Exit",
        backgroundColor: "#ffffff",
        textColor: "#1e293b",
        buttonColor: "#0f172a",
        buttonTextColor: "#ffffff",
        fontFamily: "system-ui",
        showLogo: true,
        showIllustration: false,
        gradientEnabled: false,
        gradientFrom: "#0f172a",
        gradientTo: "#334155",
      },
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your workspace branding and customer experience.
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="experience">Customer Experience</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Customize how your workspace looks to your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-upload">Company Logo</Label>
                <div className="flex items-start gap-4">
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
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, or SVG up to 2MB
                    </p>
                  </div>
                  {(logoPreview || logo) && (
                    <div className="h-16 w-16 rounded-lg border overflow-hidden bg-gray-50 flex items-center justify-center">
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
                <Label htmlFor="brand-color">Brand Color</Label>
                <div className="flex gap-3">
                  <Input
                    id="brand-color"
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your branding looks in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="rounded-lg border p-6 space-y-4"
                style={{ borderColor: brandColor }}
              >
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img src={logo} alt="Logo" className="h-8 w-8 rounded" />
                  ) : (
                    <div 
                      className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: brandColor }}
                    >
                      {companyName?.charAt(0).toUpperCase() || "E"}
                    </div>
                  )}
                  <span className="font-semibold">{companyName || "Your Company"}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This is how your branding will appear to customers during the interview process.
                  </p>
                  <Button 
                    style={{ backgroundColor: brandColor }}
                    className="text-white hover:opacity-90"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Experience Builder</CardTitle>
              <CardDescription>
                Customize the pre-interview page customers see after cancellation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div>
                <Label className="text-sm font-medium">Choose a Template</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setExperienceConfig(template.config);
                      }}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedTemplate === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                      <div className="mt-2 h-2 rounded-full" style={{
                        background: template.config.gradientEnabled
                          ? `linear-gradient(to right, ${template.config.gradientFrom}, ${template.config.gradientTo})`
                          : template.config.buttonColor
                      }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview with Device Switcher */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Live Preview</Label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 ${previewDevice === "desktop" ? "bg-blue-100 text-blue-700" : ""}`}
                      onClick={() => setPreviewDevice("desktop")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 ${previewDevice === "tablet" ? "bg-blue-100 text-blue-700" : ""}`}
                      onClick={() => setPreviewDevice("tablet")}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 ${previewDevice === "mobile" ? "bg-blue-100 text-blue-700" : ""}`}
                      onClick={() => setPreviewDevice("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div
                  className={`mx-auto border rounded-lg overflow-hidden ${
                    previewDevice === "desktop"
                      ? "max-w-3xl"
                      : previewDevice === "tablet"
                      ? "max-w-md"
                      : "max-w-xs"
                  }`}
                  style={{
                    background: experienceConfig.gradientEnabled
                      ? `linear-gradient(135deg, ${experienceConfig.gradientFrom}, ${experienceConfig.gradientTo})`
                      : experienceConfig.backgroundColor
                  }}
                >
                  <div className="p-6 space-y-4" style={{ fontFamily: experienceConfig.fontFamily }}>
                    {experienceConfig.showLogo && (
                      <div className="flex items-center gap-2">
                        {(logoPreview || logo) ? (
                          <img
                            src={logoPreview || logo}
                            alt="Company Logo"
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <div
                            className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: experienceConfig.buttonColor }}
                          >
                            {companyName?.charAt(0).toUpperCase() || "E"}
                          </div>
                        )}
                        <span className="font-semibold text-sm" style={{ color: experienceConfig.textColor }}>
                          {companyName || "Your Company"}
                        </span>
                      </div>
                    )}
                    {experienceConfig.showIllustration && (
                      <div className="flex justify-center py-4">
                        <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <MessageSquare className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    )}
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: experienceConfig.textColor }}
                    >
                      {experienceConfig.headline}
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: experienceConfig.textColor }}>
                      {experienceConfig.description}
                    </p>
                    <div className="flex gap-3 pt-4">
                      <Button
                        style={{
                          background: experienceConfig.gradientEnabled
                            ? `linear-gradient(to right, ${experienceConfig.gradientFrom}, ${experienceConfig.gradientTo})`
                            : experienceConfig.buttonColor,
                          color: experienceConfig.buttonTextColor,
                        }}
                        className="flex-1"
                      >
                        {experienceConfig.ctaText}
                      </Button>
                      <Button variant="outline" className="flex-1" style={{ borderColor: experienceConfig.textColor, color: experienceConfig.textColor }}>
                        {experienceConfig.skipText}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customization Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Content</Label>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="headline" className="text-xs">Headline</Label>
                      <Input
                        id="headline"
                        value={experienceConfig.headline}
                        onChange={(e) =>
                          setExperienceConfig({ ...experienceConfig, headline: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-xs">Description</Label>
                      <Textarea
                        id="description"
                        value={experienceConfig.description}
                        onChange={(e) =>
                          setExperienceConfig({ ...experienceConfig, description: e.target.value })
                        }
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="cta" className="text-xs">CTA Button</Label>
                        <Input
                          id="cta"
                          value={experienceConfig.ctaText}
                          onChange={(e) =>
                            setExperienceConfig({ ...experienceConfig, ctaText: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="skip" className="text-xs">Skip Button</Label>
                        <Input
                          id="skip"
                          value={experienceConfig.skipText}
                          onChange={(e) =>
                            setExperienceConfig({ ...experienceConfig, skipText: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Colors</Label>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="gradient-enabled"
                        checked={experienceConfig.gradientEnabled}
                        onChange={(e) =>
                          setExperienceConfig({ ...experienceConfig, gradientEnabled: e.target.checked })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="gradient-enabled" className="text-xs">Enable Gradient</Label>
                    </div>
                    {experienceConfig.gradientEnabled ? (
                      <>
                        <div>
                          <Label htmlFor="gradient-from" className="text-xs">Gradient From</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="gradient-from"
                              type="color"
                              value={experienceConfig.gradientFrom}
                              onChange={(e) =>
                                setExperienceConfig({ ...experienceConfig, gradientFrom: e.target.value })
                              }
                              className="w-12 h-9 p-1"
                            />
                            <Input
                              value={experienceConfig.gradientFrom}
                              onChange={(e) =>
                                setExperienceConfig({ ...experienceConfig, gradientFrom: e.target.value })
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="gradient-to" className="text-xs">Gradient To</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="gradient-to"
                              type="color"
                              value={experienceConfig.gradientTo}
                              onChange={(e) =>
                                setExperienceConfig({ ...experienceConfig, gradientTo: e.target.value })
                              }
                              className="w-12 h-9 p-1"
                            />
                            <Input
                              value={experienceConfig.gradientTo}
                              onChange={(e) =>
                                setExperienceConfig({ ...experienceConfig, gradientTo: e.target.value })
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="bg-color" className="text-xs">Background</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="bg-color"
                              type="color"
                              value={experienceConfig.backgroundColor}
                              onChange={(e) =>
                                setExperienceConfig({ ...experienceConfig, backgroundColor: e.target.value })
                              }
                              className="w-12 h-9 p-1"
                            />
                            <Input
                              value={experienceConfig.backgroundColor}
                              onChange={(e) =>
                                setExperienceConfig({ ...experienceConfig, backgroundColor: e.target.value })
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="btn-color" className="text-xs">Button</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="btn-color"
                              type="color"
                              value={experienceConfig.buttonColor}
                              onChange={(e) =>
                                setExperienceConfig({ ...experienceConfig, buttonColor: e.target.value })
                              }
                              className="w-12 h-9 p-1"
                            />
                            <Input
                              value={experienceConfig.buttonColor}
                              onChange={(e) =>
                                setExperienceConfig({ ...experienceConfig, buttonColor: e.target.value })
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <Label htmlFor="text-color" className="text-xs">Text</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="text-color"
                          type="color"
                          value={experienceConfig.textColor}
                          onChange={(e) =>
                            setExperienceConfig({ ...experienceConfig, textColor: e.target.value })
                          }
                          className="w-12 h-9 p-1"
                        />
                        <Input
                          value={experienceConfig.textColor}
                          onChange={(e) =>
                            setExperienceConfig({ ...experienceConfig, textColor: e.target.value })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveExperience} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Experience"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

