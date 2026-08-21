import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ConditionBadge } from "@/components/ConditionBadge";
import { ItemFormDialog } from "@/components/ItemFormDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  addSharedItem,
  deleteSharedItem,
  sharedItemsQuery,
  updateSharedItem,
} from "@/lib/inventory";

export const Route = createFileRoute("/fasilitas")({
  head: () => ({
    meta: [
      { title: "Fasilitas Utama Kost — Inventaris Lavin Kost" },
      {
        name: "description",
        content:
          "Catatan fasilitas bersama Lavin Kost Purwokerto: pompa air, torent, pagar, trafo listrik, dapur, lampu halaman, access point, dan IP camera.",
      },
      { property: "og:title", content: "Fasilitas Utama Kost — Inventaris Lavin Kost" },
      {
        property: "og:description",
        content: "Tambah, edit, dan kurangi fasilitas bersama Lavin Kost Purwokerto.",
      },
    ],
  }),
  component: SharedFacilities,
});

function SharedFacilities() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<string>("Semua");
  const queryClient = useQueryClient();
  const shared = useQuery(sharedItemsQuery);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["shared_items"] });
  const mutate = useMutation({
    mutationFn: async (fn: () => Promise<void>) => fn(),
    onSuccess: () => refresh(),
    onError: (error: Error) => toast.error(error.message),
  });

  const all = shared.data ?? [];
  const categories = ["Semua", ...Array.from(new Set(all.map((i) => i.category))).sort()];
  const list = all.filter(
    (i) =>
      (category === "Semua" || i.category === category) &&
      i.name.toLowerCase().includes(keyword.trim().toLowerCase()),
  );

  return (
    <AppShell
      title="Fasilitas Utama Kost"
      subtitle="Fasilitas yang dipakai bersama seluruh penghuni kost."
    >
      <div className="mb-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="relative min-w-0 sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari fasilitas..."
            className="pl-9"
            aria-label="Cari fasilitas"
          />
        </div>
        <ItemFormDialog
          trigger={
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Tambah fasilitas
            </Button>
          }
          title="Tambah fasilitas utama"
          withCategory
          onSubmit={async (values) => {
            await addSharedItem({
              name: values.name,
              category: values.category ?? "Umum",
              quantity: values.quantity,
              condition: values.condition,
              location: values.location || null,
              notes: values.notes || null,
            });
            await refresh();
            toast.success("Fasilitas ditambahkan");
          }}
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
              c === category
                ? "border-gold bg-gold text-primary-foreground"
                : "border-gold-line text-muted-foreground hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {shared.isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Tidak ada fasilitas yang cocok.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li key={item.id} className="gold-card rounded-xl p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{item.name}</p>
                    <ConditionBadge condition={item.condition} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.category}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                  {item.notes ? (
                    <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label={`Kurangi ${item.name}`}
                    className="h-8 w-8 border-gold-line"
                    disabled={item.quantity <= 0}
                    onClick={() =>
                      mutate.mutate(() =>
                        updateSharedItem(item.id, { quantity: Math.max(0, item.quantity - 1) }),
                      )
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-9 text-center text-base font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label={`Tambah ${item.name}`}
                    className="h-8 w-8 border-gold-line"
                    onClick={() =>
                      mutate.mutate(() =>
                        updateSharedItem(item.id, { quantity: item.quantity + 1 }),
                      )
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  <ItemFormDialog
                    trigger={
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${item.name}`}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                    title="Edit fasilitas"
                    withCategory
                    initial={{
                      name: item.name,
                      quantity: item.quantity,
                      condition: item.condition,
                      notes: item.notes ?? "",
                      category: item.category,
                      location: item.location ?? "",
                    }}
                    onSubmit={async (values) => {
                      await updateSharedItem(item.id, {
                        name: values.name,
                        category: values.category ?? "Umum",
                        quantity: values.quantity,
                        condition: values.condition,
                        location: values.location || null,
                        notes: values.notes || null,
                      });
                      await refresh();
                      toast.success("Perubahan disimpan");
                    }}
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Hapus ${item.name}`}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-gold-line">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display text-2xl">
                          Hapus {item.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Fasilitas ini akan dihapus permanen dari daftar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            mutate.mutate(async () => {
                              await deleteSharedItem(item.id);
                              toast.success("Fasilitas dihapus");
                            })
                          }
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
