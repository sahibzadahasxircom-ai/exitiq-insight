import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Trash2, Edit, Calendar, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  createProductKnowledge,
  listProductKnowledge,
  deleteProductKnowledge,
  updateProductKnowledge,
} from "@/lib/product-knowledge.functions";
import {
  createWhatsNew,
  listWhatsNew,
  deleteWhatsNew,
  updateWhatsNew,
} from "@/lib/whats-new.functions";

export const Route = createFileRoute("/_authenticated/product-knowledge")({
  head: () => ({ meta: [{ title: "Product Knowledge — leaveesy" }] }),
  component: ProductKnowledgePage,
});

type ProductKnowledge = {
  id: string;
  title: string;
  content: string;
  type: "feature" | "update" | "general";
  created_at: string;
  updated_at: string;
};

type WhatsNew = {
  id: string;
  title: string;
  content: string;
  type: "feature" | "update" | "bugfix" | "improvement";
  file_url?: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
};

function ProductKnowledgePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("product-details");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductKnowledge | WhatsNew | null>(null);
  const [dialogType, setDialogType] = useState<"product-details" | "whats-new">("product-details");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "feature" as "feature" | "update" | "bugfix" | "improvement",
  });

  // Fetch product knowledge
  const { data: knowledgeItems = [], isLoading: isLoadingKnowledge } = useQuery({
    queryKey: ["product-knowledge"],
    queryFn: async () => {
      const result = await listProductKnowledge();
      return result;
    },
  });

  // Fetch whats new
  const { data: whatsNewItems = [], isLoading: isLoadingWhatsNew } = useQuery({
    queryKey: ["whats-new"],
    queryFn: async () => {
      const result = await listWhatsNew();
      return result;
    },
  });

  // Dynamic tab ordering: Product Details first if empty, What's New first if Product Details has content
  useEffect(() => {
    if (knowledgeItems.length > 0) {
      setActiveTab("whats-new");
    }
  }, [knowledgeItems.length]);

  // Create mutation for product details
  const createProductDetailsMutation = useMutation({
    mutationFn: createProductKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-knowledge"] });
      toast.success("Product details added");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add product details");
    },
  });

  // Create mutation for whats new
  const createWhatsNewMutation = useMutation({
    mutationFn: createWhatsNew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whats-new"] });
      toast.success("What's New added");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add What's New");
    },
  });

  // Update mutation for product details
  const updateProductDetailsMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; content?: string; type?: "feature" | "update" | "general" }) =>
      updateProductKnowledge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-knowledge"] });
      toast.success("Product details updated");
      setIsDialogOpen(false);
      resetForm();
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product details");
    },
  });

  // Update mutation for whats new
  const updateWhatsNewMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; content?: string; type?: "feature" | "update" | "bugfix" | "improvement" }) =>
      updateWhatsNew(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whats-new"] });
      toast.success("What's New updated");
      setIsDialogOpen(false);
      resetForm();
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update What's New");
    },
  });

  // Delete mutation for product details
  const deleteProductDetailsMutation = useMutation({
    mutationFn: deleteProductKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-knowledge"] });
      toast.success("Product details deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product details");
    },
  });

  // Delete mutation for whats new
  const deleteWhatsNewMutation = useMutation({
    mutationFn: deleteWhatsNew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whats-new"] });
      toast.success("What's New deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete What's New");
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", type: "feature" });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      if (dialogType === "product-details") {
        updateProductDetailsMutation.mutate({
          id: editingItem.id,
          title: formData.title,
          content: formData.content,
        });
      } else {
        updateWhatsNewMutation.mutate({
          id: editingItem.id,
          title: formData.title,
          content: formData.content,
          type: formData.type as "feature" | "update" | "bugfix" | "improvement",
        });
      }
    } else {
      if (dialogType === "product-details") {
        createProductDetailsMutation.mutate({
          title: formData.title,
          content: formData.content,
        });
      } else {
        createWhatsNewMutation.mutate({
          title: formData.title,
          content: formData.content,
          type: formData.type,
        });
      }
    }
  };

  const handleEdit = (item: ProductKnowledge | WhatsNew, type: "product-details" | "whats-new") => {
    setEditingItem(item);
    setDialogType(type);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, type: "product-details" | "whats-new") => {
    if (confirm("Are you sure you want to delete this item?")) {
      if (type === "product-details") {
        deleteProductDetailsMutation.mutate({ id });
      } else {
        deleteWhatsNewMutation.mutate({ id });
      }
    }
  };

  const handleAdd = (type: "product-details" | "whats-new") => {
    setDialogType(type);
    setEditingItem(null);
    setFormData({ title: "", content: "", type: "feature" });
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "update":
        return "bg-green-100 text-green-700 border-green-200";
      case "general":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "bugfix":
        return "bg-red-100 text-red-700 border-red-200";
      case "improvement":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product Knowledge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product details and what's new to help AI provide better insights.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product-details" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Product Details
          </TabsTrigger>
          <TabsTrigger value="whats-new" className="gap-2">
            <Zap className="h-4 w-4" />
            What's New?
          </TabsTrigger>
        </TabsList>

        {/* Product Details Tab */}
        <TabsContent value="product-details" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Product Details</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive information about your product features and capabilities.
            </p>
          </div>
          <Button onClick={() => handleAdd("product-details")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product Details
          </Button>
        </div>

        {isLoadingKnowledge ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        ) : knowledgeItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No product details yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Add comprehensive information about your product features and capabilities. This helps the AI
                understand your product better during exit interviews.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Quick tip</p>
                    <p className="text-blue-700">
                      Use ChatGPT or any AI to generate a quick summary of your product features, then paste it
                      here.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {knowledgeItems.map((item: ProductKnowledge) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        Added {formatDate(item.created_at)}
                        {item.updated_at !== item.created_at && (
                          <> • Updated {formatDate(item.updated_at)}</>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(item, "product-details")}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id, "product-details")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* What's New Tab */}
      <TabsContent value="whats-new" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">What's New?</h2>
            <p className="text-sm text-muted-foreground">
              Track new features and updates to monitor their performance in conversations.
            </p>
          </div>
          <Button onClick={() => handleAdd("whats-new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add What's New
          </Button>
        </div>

        {isLoadingWhatsNew ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading what's new...</p>
          </div>
        ) : whatsNewItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Add your latest features and updates here. The AI will track how these perform in customer
                conversations to help you understand their impact.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {whatsNewItems.map((item: WhatsNew) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge className={getTypeColor(item.type)} variant="outline">
                          {item.type}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        Added {formatDate(item.created_at)}
                        {item.updated_at !== item.created_at && (
                          <> • Updated {formatDate(item.updated_at)}</>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(item, "whats-new")}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id, "whats-new")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</p>
                  {item.file_name && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>📎</span>
                      <span>{item.file_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? `Edit ${dialogType === "product-details" ? "Product Details" : "What's New"}`
                : `Add ${dialogType === "product-details" ? "Product Details" : "What's New"}`
              }
            </DialogTitle>
            <DialogDescription>
              {dialogType === "product-details"
                ? editingItem
                  ? "Update the product details entry."
                  : "Add comprehensive information about your product features and capabilities."
                : editingItem
                ? "Update the what's new entry."
                : "Add information about your latest features and updates."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder={dialogType === "product-details" ? "e.g., Dashboard Overview" : "e.g., New Sidebar Design"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            {dialogType === "whats-new" && (
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="bugfix">Bugfix</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder={dialogType === "product-details"
                  ? "Describe your product features, capabilities, and current state. You can paste content from ChatGPT or other sources."
                  : "Describe the new feature or update. This will be tracked in conversations to measure performance."
                }
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                {dialogType === "product-details"
                  ? "Tip: Use ChatGPT or any AI to generate a comprehensive summary of your product features and workflow."
                  : "Tip: Be specific about what changed. This helps track how customers react to new features."}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createProductDetailsMutation.isPending ||
                  createWhatsNewMutation.isPending ||
                  updateProductDetailsMutation.isPending ||
                  updateWhatsNewMutation.isPending
                }
              >
                {createProductDetailsMutation.isPending ||
                createWhatsNewMutation.isPending ||
                updateProductDetailsMutation.isPending ||
                updateWhatsNewMutation.isPending
                  ? "Saving..."
                  : editingItem
                  ? "Update"
                  : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
