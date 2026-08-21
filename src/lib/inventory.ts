import { supabase } from "@/integrations/supabase/client";

export type Condition = "Baik" | "Perlu Perbaikan" | "Rusak";

export const CONDITIONS: Condition[] = ["Baik", "Perlu Perbaikan", "Rusak"];

export const SHARED_CATEGORIES = [
  "Air",
  "Listrik",
  "Bangunan",
  "Dapur",
  "Penerangan",
  "Jaringan",
  "Keamanan",
  "Umum",
];

export const DEFAULT_ROOM_ITEMS = [
  "TV",
  "AC",
  "Dipan",
  "Meja Belajar",
  "Kursi Pendek",
  "Kursi Panjang",
  "MCB Listrik",
  "Kasur",
  "Bantal Guling",
];

export type Room = {
  id: string;
  number: string;
  floor: number;
  notes: string | null;
};

export type RoomItem = {
  id: string;
  room_id: string;
  name: string;
  quantity: number;
  condition: string;
  notes: string | null;
};

export type SharedItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: string;
  location: string | null;
  notes: string | null;
};

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export const roomsQuery = {
  queryKey: ["rooms"] as const,
  queryFn: async (): Promise<Room[]> =>
    unwrap(
      await supabase.from("rooms").select("id, number, floor, notes").order("number"),
    ) as Room[],
};

export const allRoomItemsQuery = {
  queryKey: ["room_items", "all"] as const,
  queryFn: async (): Promise<RoomItem[]> =>
    unwrap(
      await supabase
        .from("room_items")
        .select("id, room_id, name, quantity, condition, notes")
        .order("created_at"),
    ) as RoomItem[],
};

export const sharedItemsQuery = {
  queryKey: ["shared_items"] as const,
  queryFn: async (): Promise<SharedItem[]> =>
    unwrap(
      await supabase
        .from("shared_items")
        .select("id, name, category, quantity, condition, location, notes")
        .order("category")
        .order("name"),
    ) as SharedItem[],
};

/* ---- mutations ---- */

export async function addRoomItem(input: {
  room_id: string;
  name: string;
  quantity: number;
  condition: string;
  notes?: string | null;
}) {
  const { error } = await supabase.from("room_items").insert(input);
  if (error) throw new Error(error.message);
}

export async function updateRoomItem(
  id: string,
  patch: Partial<Pick<RoomItem, "name" | "quantity" | "condition" | "notes">>,
) {
  const { error } = await supabase.from("room_items").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRoomItem(id: string) {
  const { error } = await supabase.from("room_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addSharedItem(input: {
  name: string;
  category: string;
  quantity: number;
  condition: string;
  location?: string | null;
  notes?: string | null;
}) {
  const { error } = await supabase.from("shared_items").insert(input);
  if (error) throw new Error(error.message);
}

export async function updateSharedItem(
  id: string,
  patch: Partial<Pick<SharedItem, "name" | "category" | "quantity" | "condition" | "location" | "notes">>,
) {
  const { error } = await supabase.from("shared_items").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSharedItem(id: string) {
  const { error } = await supabase.from("shared_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function seedRoomItems(roomId: string) {
  const { error } = await supabase.from("room_items").insert(
    DEFAULT_ROOM_ITEMS.map((name) => ({
      room_id: roomId,
      name,
      quantity: name === "Bantal Guling" ? 2 : 1,
      condition: "Baik",
    })),
  );
  if (error) throw new Error(error.message);
}
