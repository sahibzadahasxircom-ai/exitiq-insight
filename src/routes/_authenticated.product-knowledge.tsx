import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Trash2, Edit, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  createProductKnowledge,
  listProductKnowledge,
  deleteProductKnowledge,
  updateProductKnowledge,
} from "@/lib/product-knowledge.functions";

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

function ProductKnowledgePage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductKnowledge | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "feature" as "feature" | "update" | "general",
  });

  // Fetch product knowledge
  const { data: knowledgeItems = [], isLoading } = useQuery({
    queryKey: ["product-knowledge"],
    queryFn: async () => {
      const result = await listProductKnowledge();
      return result;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProductKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-knowledge"] });
      toast.success("Product knowledge added");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add product knowledge");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title?: string; content?: string; type?: "feature" | "update" | "general" }) =>
      updateProductKnowledge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-knowledge"] });
      toast.success("Product knowledge updated");
      setIsDialogOpen(false);
      resetForm();
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product knowledge");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProductKnowledge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-knowledge"] });
      toast.success("Product knowledge deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product knowledge");
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", type: "feature" });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        title: formData.title,
        content: formData.content,
        type: formData.type,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: ProductKnowledge) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate({ id });
    }
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
            Manage your product features and updates to help AI provide better insights.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Product Knowledge" : "Add Product Knowledge"}</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the product knowledge entry."
                  : "Add information about your product features, updates, or general information."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., New Dashboard Design"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Describe the feature or update in detail. You can paste content from ChatGPT or other sources."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Use ChatGPT or any AI to generate a quick summary of your product features, then paste it here.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending
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

      {/* Empty State */}
      {!isLoading && knowledgeItems.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No product knowledge yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Add your product features and updates to help the AI understand your product better during exit
              interviews. This enables the AI to reference specific features when customers mention them.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Quick tip</p>
                  <p className="text-blue-700">
                    Use ChatGPT or any AI to generate a quick summary of your product features, then paste it
                    here. This helps the AI provide more contextual responses during interviews.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Items List */}
      {!isLoading && knowledgeItems.length > 0 && (
        <div className="space-y-4">
          {knowledgeItems.map((item: ProductKnowledge) => (
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
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
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

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading product knowledge...</p>
        </div>
      )}
    </div>
  );
}
