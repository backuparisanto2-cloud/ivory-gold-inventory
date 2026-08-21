import { useState, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { CONDITIONS, SHARED_CATEGORIES } from "@/lib/inventory";

export type ItemFormValues = {
  name: string;
  quantity: number;
  condition: string;
  notes: string;
  category?: string;
  location?: string;
};

export function ItemFormDialog({
  trigger,
  title,
  description,
  initial,
  withCategory = false,
  onSubmit,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  initial?: Partial<ItemFormValues>;
  withCategory?: boolean;
  onSubmit: (values: ItemFormValues) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<ItemFormValues>({
    name: initial?.name ?? "",
    quantity: initial?.quantity ?? 1,
    condition: initial?.condition ?? "Baik",
    notes: initial?.notes ?? "",
    category: initial?.category ?? "Umum",
    location: initial?.location ?? "",
  });

  function set<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setValues({
            name: initial?.name ?? "",
            quantity: initial?.quantity ?? 1,
            condition: initial?.condition ?? "Baik",
            notes: initial?.notes ?? "",
            category: initial?.category ?? "Umum",
            location: initial?.location ?? "",
          });
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md border-gold-line">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!values.name.trim()) return;
            setSaving(true);
            try {
              await onSubmit({ ...values, name: values.name.trim() });
              setOpen(false);
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="item-name">Nama barang</Label>
            <Input
              id="item-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Contoh: Lemari Pakaian"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="item-qty">Jumlah</Label>
              <Input
                id="item-qty"
                type="number"
                min={0}
                value={values.quantity}
                onChange={(e) => set("quantity", Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <div className="space-y-2">
              <Label>Kondisi</Label>
              <Select value={values.condition} onValueChange={(v) => set("condition", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {withCategory ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={values.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHARED_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-loc">Lokasi</Label>
                <Input
                  id="item-loc"
                  value={values.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Contoh: Halaman depan"
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="item-notes">Catatan</Label>
            <Textarea
              id="item-notes"
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Opsional"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
