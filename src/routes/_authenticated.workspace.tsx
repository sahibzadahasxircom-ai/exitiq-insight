import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Monitor, Tablet, Smartphone, Layout, Save, Upload, ArrowRight } from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-Form Customization State
  const [preFormStyle, setPreFormStyle] = useState("professional");
  const [preFormTitle, setPreFormTitle] = useState("We're sorry to see you go");
  const [preFormDescription, setPreFormDescription] = useState("Help us improve by sharing your feedback");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [backgroundStyle, setBackgroundStyle] = useState("gradient");
  
  console.log("Background style state:", backgroundStyle);

  // Load existing company pre-form settings
  useEffect(() => {
    if (company?.id) {
      const loadCompanySettings = async () => {
        const { data } = await supabase
          .from("companies")
          .select("pre_form_style, pre_form_title, pre_form_description, brand_color, company_logo, company_name, background_style")
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
    } catch (error) {
      console.error("Failed to save branding:", error);
      alert("Failed to save branding. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreForm = async () => {
    if (!company?.id) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("companies")
        .update({
          pre_form_style: preFormStyle,
          pre_form_title: preFormTitle,
          pre_form_description: preFormDescription,
          background_style: backgroundStyle,
        })
        .eq("id", company.id);

      if (error) {
        console.error("Failed to save pre-form settings:", error);
        throw error;
      }

      console.log("Pre-form settings saved successfully");
    } catch (error) {
      console.error("Failed to save pre-form settings:", error);
      alert("Failed to save pre-form settings. Check console for details.");
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
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your workspace branding and customer experience.
        </p>
      </div>

      <Tabs defaultValue="pre-form" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pre-form">Pre-Form Customization</TabsTrigger>
        </TabsList>

        <TabsContent value="pre-form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Customize your company logo, name, and brand color.
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
                  {saving ? "Saving..." : "Save Branding"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Style & Content</CardTitle>
              <CardDescription>
                Customize the form customers see before starting their conversation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Template Selection */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Form Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {preFormTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setPreFormStyle(template.id)}
                      className={`p-3 rounded-lg border text-left transition-all group ${
                        preFormStyle === template.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Effect */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Form Background Effect</Label>
                <Select value={backgroundStyle} onValueChange={(value) => {
                  console.log("Background style changed to:", value);
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
                <p className="text-xs text-muted-foreground mt-2">
                  Choose the background effect for the pre-form card using your brand color
                </p>
              </div>

              {/* Content Customization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="pre-form-title" className="text-sm font-semibold mb-2 block">
                      Form Title
                    </Label>
                    <Input
                      id="pre-form-title"
                      value={preFormTitle}
                      onChange={(e) => setPreFormTitle(e.target.value)}
                      placeholder="We're sorry to see you go"
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      The main heading displayed on the pre-form page.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="pre-form-description" className="text-sm font-semibold mb-2 block">
                      Form Description
                    </Label>
                    <Textarea
                      id="pre-form-description"
                      value={preFormDescription}
                      onChange={(e) => setPreFormDescription(e.target.value)}
                      placeholder="Help us improve by sharing your feedback"
                      rows={4}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      The subtitle text explaining the purpose of the form.
                    </p>
                  </div>
                  
                  {/* Copy Examples */}
                  <div className="pt-4 border-t">
                    <Label className="text-sm font-semibold mb-3 block">Copy Examples</Label>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setPreFormTitle("One last thing before you go.");
                          setPreFormDescription("We'd genuinely like to understand what made you leave. No long survey — just a quick conversation.");
                        }}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                      >
                        <div className="font-medium text-sm mb-1">More Emotional</div>
                        <div className="text-xs text-muted-foreground">
                          "One last thing before you go. We'd genuinely like to understand what made you leave. No long survey — just a quick conversation."
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setPreFormTitle("Before you leave, can we ask why?");
                          setPreFormDescription("This isn't a survey. Just tell us what happened in a quick conversation — your feedback matters.");
                        }}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                      >
                        <div className="font-medium text-sm mb-1">Curiosity-Driven</div>
                        <div className="text-xs text-muted-foreground">
                          "Before you leave, can we ask why? This isn't a survey. Just tell us what happened in a quick conversation — your feedback matters."
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setPreFormTitle("Before you go — one quick conversation?");
                          setPreFormDescription("We'd love to understand what happened. It takes less than 60 seconds.");
                        }}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
                      >
                        <div className="font-medium text-sm mb-1">Tight & Direct</div>
                        <div className="text-xs text-muted-foreground">
                          "Before you go — one quick conversation? We'd love to understand what happened. It takes less than 60 seconds."
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Live Preview</Label>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${previewDevice === "desktop" ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => setPreviewDevice("desktop")}
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${previewDevice === "tablet" ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => setPreviewDevice("tablet")}
                      >
                        <Tablet className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${previewDevice === "mobile" ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => setPreviewDevice("mobile")}
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div
                    className={`mx-auto border rounded-xl overflow-hidden relative ${
                      previewDevice === "desktop"
                        ? "max-w-lg"
                        : previewDevice === "tablet"
                        ? "max-w-sm"
                        : "max-w-[280px]"
                    } ${
                      preFormStyle === "casual" ? "rounded-2xl border-2" : 
                      preFormStyle === "minimal" ? "border-none shadow-none bg-transparent" : ""
                    }`}
                    style={{ backgroundColor: backgroundStyle === "none" ? "transparent" : "white" }}
                  >
                    {/* Background effect for the card */}
                    {backgroundStyle === "mesh" && (
                      <div 
                        className="absolute inset-0 opacity-20 pointer-events-none"
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
                        className="absolute inset-0 opacity-15 pointer-events-none"
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
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: `radial-gradient(circle, ${brandColor} 1px, transparent 1px)`,
                          backgroundSize: '20px 20px'
                        }}
                      />
                    )}
                    {backgroundStyle === "layers" && (
                      <>
                        <div 
                          className="absolute inset-0 opacity-10 pointer-events-none"
                          style={{
                            background: `linear-gradient(180deg, ${brandColor} 0%, transparent 100%)`
                          }}
                        />
                        <div 
                          className="absolute inset-0 opacity-5 pointer-events-none"
                          style={{
                            background: `linear-gradient(180deg, transparent 0%, ${brandColor} 100%)`
                          }}
                        />
                      </>
                    )}
                    {backgroundStyle === "gradient" && (
                      <div 
                        className="absolute inset-0 opacity-15 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 20% 20%, ${brandColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${brandColor} 0%, transparent 50%)`
                        }}
                      />
                    )}
                    
                    <div className={`p-6 space-y-4 relative z-10 ${
                      preFormStyle === "minimal" ? "text-center" : ""
                    }`}>
                      <div className={`space-y-1 ${
                        preFormStyle === "minimal" ? "text-center" : ""
                      }`}>
                        <h3 className={`${
                          preFormStyle === "casual" ? "text-2xl font-semibold" :
                          preFormStyle === "minimal" ? "text-xl font-medium" : "text-xl font-bold"
                        } tracking-tight`}>
                          {preFormTitle}
                        </h3>
                        <p className={`${
                          preFormStyle === "casual" ? "text-base" :
                          preFormStyle === "minimal" ? "text-sm" : "text-sm"
                        } text-muted-foreground`}>
                          {preFormDescription}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Your name (optional)</Label>
                          <Input 
                            placeholder="John Doe"
                            disabled
                            className={preFormStyle === "minimal" ? "border-b rounded-none px-0" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Your email (optional)</Label>
                          <Input 
                            type="email"
                            placeholder="john@example.com"
                            disabled
                            className={preFormStyle === "minimal" ? "border-b rounded-none px-0" : ""}
                          />
                        </div>
                        <Button 
                          className={`w-full gap-2 ${
                            preFormStyle === "casual" ? "rounded-full text-lg py-6" :
                            preFormStyle === "minimal" ? "border-2 bg-transparent hover:bg-muted" : ""
                          }`}
                          size="lg"
                          disabled
                        >
                          Start Conversation
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <Button 
                  onClick={handleSavePreForm} 
                  disabled={saving}
                  size="lg"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

