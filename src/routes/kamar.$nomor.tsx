import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus, Pencil, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ConditionBadge } from "@/components/ConditionBadge";
import { ItemFormDialog } from "@/components/ItemFormDialog";
import { Button } from "@/components/ui/button";
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
  addRoomItem,
  allRoomItemsQuery,
  deleteRoomItem,
  roomsQuery,
  seedRoomItems,
  updateRoomItem,
} from "@/lib/inventory";

export const Route = createFileRoute("/kamar/$nomor")({
  head: ({ params }) => ({
    meta: [
      { title: `Kamar ${params.nomor} — Inventaris Lavin Kost` },
      {
        name: "description",
        content: `Inventaris fasilitas kamar ${params.nomor} Lavin Kost Purwokerto: tambah, edit, dan kurangi barang.`,
      },
      { property: "og:title", content: `Kamar ${params.nomor} — Inventaris Lavin Kost` },
      {
        property: "og:description",
        content: `Catatan fasilitas kamar ${params.nomor} Lavin Kost Purwokerto.`,
      },
    ],
  }),
  component: RoomDetail,
});

function RoomDetail() {
  const { nomor } = Route.useParams();
  const queryClient = useQueryClient();
  const rooms = useQuery(roomsQuery);
  const items = useQuery(allRoomItemsQuery);

  const room = (rooms.data ?? []).find((r) => r.number === nomor);
  const roomItems = (items.data ?? []).filter((i) => i.room_id === room?.id);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["room_items"] });

  const mutate = useMutation({
    mutationFn: async (fn: () => Promise<void>) => fn(),
    onSuccess: () => refresh(),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title={room ? `Kamar ${room.number}` : `Kamar ${nomor}`}
      subtitle={room ? `Lantai ${room.floor} · ${roomItems.length} jenis barang` : undefined}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/kamar"
          search={{ lantai: room?.floor ?? 1 }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar kamar
        </Link>

        <div className="flex gap-2">
          {roomItems.length === 0 && room ? (
            <Button
              variant="outline"
              onClick={() => mutate.mutate(() => seedRoomItems(room.id))}
              className="border-gold-line"
            >
              <Sparkles className="mr-2 h-4 w-4" /> Isi item standar
            </Button>
          ) : null}
          {room ? (
            <ItemFormDialog
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Tambah barang
                </Button>
              }
              title="Tambah barang kamar"
              description={`Barang baru untuk kamar ${room.number}.`}
              onSubmit={async (values) => {
                await addRoomItem({
                  room_id: room.id,
                  name: values.name,
                  quantity: values.quantity,
                  condition: values.condition,
                  notes: values.notes || null,
                });
                await refresh();
                toast.success("Barang ditambahkan");
              }}
            />
          ) : null}
        </div>
      </div>

      {rooms.isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : !room ? (
        <p className="text-sm text-muted-foreground">Kamar {nomor} tidak ditemukan.</p>
      ) : roomItems.length === 0 ? (
        <div className="gold-card rounded-xl p-8 text-center">
          <p className="font-display text-xl">Belum ada barang tercatat</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tambahkan barang satu per satu atau isi dengan daftar item standar.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {roomItems.map((item) => (
            <li key={item.id} className="gold-card rounded-xl p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{item.name}</p>
                    <ConditionBadge condition={item.condition} />
                  </div>
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
                        updateRoomItem(item.id, { quantity: Math.max(0, item.quantity - 1) }),
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
                      mutate.mutate(() => updateRoomItem(item.id, { quantity: item.quantity + 1 }))
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
                    title="Edit barang"
                    initial={{
                      name: item.name,
                      quantity: item.quantity,
                      condition: item.condition,
                      notes: item.notes ?? "",
                    }}
                    onSubmit={async (values) => {
                      await updateRoomItem(item.id, {
                        name: values.name,
                        quantity: values.quantity,
                        condition: values.condition,
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
                          Data barang ini akan dihapus permanen dari kamar {room.number}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            mutate.mutate(async () => {
                              await deleteRoomItem(item.id);
                              toast.success("Barang dihapus");
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
