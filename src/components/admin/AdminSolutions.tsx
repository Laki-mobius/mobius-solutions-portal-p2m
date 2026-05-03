import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Solution } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FileOrUrlInput } from "./FileOrUrlInput";

type Form = Omit<Solution, "id" | "created_at"> & { id?: string };

const empty: Form = {
  title: "",
  description: "",
  icon_url: "",
  thumbnail_url: "",
  target_url: "",
  solution_type: "internal",
};

export const AdminSolutions = () => {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Solution[];
    },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  useEffect(() => {
    if (!open) setForm(empty);
  }, [open]);

  const save = async () => {
    if (!form.title.trim() || !form.target_url.trim()) {
      toast.error("Title and target URL are required");
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description ?? "",
      icon_url: form.icon_url || null,
      thumbnail_url: form.thumbnail_url || null,
      target_url: form.target_url.trim(),
      solution_type: form.solution_type,
    };
    const { error } = form.id
      ? await supabase.from("solutions").update(payload).eq("id", form.id)
      : await supabase.from("solutions").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Solution updated" : "Solution created");
    qc.invalidateQueries({ queryKey: ["admin", "solutions"] });
    qc.invalidateQueries({ queryKey: ["solutions"] });
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this solution?")) return;
    const { error } = await supabase.from("solutions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "solutions"] });
    qc.invalidateQueries({ queryKey: ["solutions"] });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setForm(empty);
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add solution
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Target</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  No solutions yet.
                </td>
              </tr>
            ) : (
              data.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3 font-medium">{s.title}</td>
                  <td className="p-3 capitalize">{s.solution_type}</td>
                  <td className="max-w-xs truncate p-3 text-muted-foreground">{s.target_url}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setForm({ ...s, description: s.description ?? "", icon_url: s.icon_url ?? "", thumbnail_url: s.thumbnail_url ?? "" });
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit solution" : "New solution"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.solution_type}
                onValueChange={(v) =>
                  setForm({ ...form, solution_type: v as "internal" | "external" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target URL</Label>
              <Input
                value={form.target_url}
                onChange={(e) => setForm({ ...form, target_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <FileOrUrlInput
                value={form.icon_url ?? ""}
                onChange={(url) => setForm({ ...form, icon_url: url })}
                accept="image/*"
                prefix="icons"
              />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail (16:10 recommended)</Label>
              <FileOrUrlInput
                value={form.thumbnail_url ?? ""}
                onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                accept="image/*"
                prefix="thumbnails"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
