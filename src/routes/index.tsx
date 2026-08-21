import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DoorClosed, Wrench, AlertTriangle, Boxes } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { allRoomItemsQuery, roomsQuery, sharedItemsQuery } from "@/lib/inventory";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inventaris Lavin Kost Purwokerto" },
      {
        name: "description",
        content:
          "Pencatatan inventaris fasilitas utama dan fasilitas per kamar Lavin Kost Purwokerto: tambah, edit, dan kurangi barang dengan mudah.",
      },
      { property: "og:title", content: "Inventaris Lavin Kost Purwokerto" },
      {
        property: "og:description",
        content: "Kelola inventaris 32 kamar dan fasilitas bersama Lavin Kost Purwokerto.",
      },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: typeof Boxes;
  tone?: "gold" | "danger";
}) {
  return (
    <div className="gold-card rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
        <Icon className={`h-4 w-4 ${tone === "danger" ? "text-destructive" : "text-gold"}`} />
      </div>
      <p
        className={`mt-2 font-display text-3xl font-semibold ${
          tone === "danger" ? "text-destructive" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Dashboard() {
  const rooms = useQuery(roomsQuery);
  const items = useQuery(allRoomItemsQuery);
  const shared = useQuery(sharedItemsQuery);

  const roomItems = items.data ?? [];
  const sharedItems = shared.data ?? [];
  const totalUnit =
    roomItems.reduce((a, i) => a + i.quantity, 0) + sharedItems.reduce((a, i) => a + i.quantity, 0);
  const perluPerhatian = [...roomItems, ...sharedItems].filter((i) => i.condition !== "Baik");

  const rusakPerKamar = new Map<string, number>();
  for (const item of roomItems) {
    if (item.condition !== "Baik") {
      rusakPerKamar.set(item.room_id, (rusakPerKamar.get(item.room_id) ?? 0) + 1);
    }
  }
  const kamarBermasalah = (rooms.data ?? [])
    .filter((r) => rusakPerKamar.has(r.id))
    .slice(0, 8);

  return (
    <AppShell
      title="Ringkasan Inventaris"
      subtitle="Catatan fasilitas utama dan fasilitas per kamar Lavin Kost Purwokerto."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total Kamar" value={rooms.data?.length ?? "—"} icon={DoorClosed} />
        <Stat label="Fasilitas Utama" value={sharedItems.length || "—"} icon={Wrench} />
        <Stat label="Total Unit Barang" value={totalUnit || "—"} icon={Boxes} />
        <Stat
          label="Perlu Perhatian"
          value={perluPerhatian.length}
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="gold-card rounded-xl p-5">
          <h2 className="font-display text-xl font-semibold">Akses Cepat</h2>
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((floor) => (
              <Link
                key={floor}
                to="/kamar"
                search={{ lantai: floor }}
                className="flex items-center justify-between rounded-lg border border-gold-line px-4 py-3 text-sm transition-colors hover:bg-accent"
              >
                <span>Lantai {floor}</span>
                <span className="text-muted-foreground">
                  {(rooms.data ?? []).filter((r) => r.floor === floor).length} kamar
                </span>
              </Link>
            ))}
            <Link
              to="/fasilitas"
              className="flex items-center justify-between rounded-lg border border-gold-line px-4 py-3 text-sm transition-colors hover:bg-accent"
            >
              <span>Fasilitas Utama Kost</span>
              <span className="text-muted-foreground">{sharedItems.length} item</span>
            </Link>
          </div>
        </div>

        <div className="gold-card rounded-xl p-5">
          <h2 className="font-display text-xl font-semibold">Kamar Perlu Perhatian</h2>
          {kamarBermasalah.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Semua barang kamar tercatat dalam kondisi baik.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {kamarBermasalah.map((room) => (
                <li key={room.id}>
                  <Link
                    to="/kamar/$nomor"
                    params={{ nomor: room.number }}
                    className="flex items-center justify-between rounded-lg border border-gold-line px-4 py-3 text-sm transition-colors hover:bg-accent"
                  >
                    <span>
                      Kamar {room.number}{" "}
                      <span className="text-muted-foreground">· Lantai {room.floor}</span>
                    </span>
                    <span className="text-destructive">{rusakPerKamar.get(room.id)} item</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
