import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  getInventoryMetaForImage,
  removeInventoryMetaForImage,
  saveInventoryMetaForImage,
} from "../utils/galleryInventory";

const GalleryContext = createContext(null);

const BUCKET = "Gallery";
const TABLE = "gallery_images";

// eslint-disable-next-line react-refresh/only-export-components
export const useGallery = () => {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be used within a GalleryProvider");
  return ctx;
};

function safeFileName(name) {
  return (name || "image").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function uniqueId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function publicUrlFor(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description ?? "",
    storagePath: row.storage_path,
    createdAt: row.created_at,
    src: publicUrlFor(row.storage_path),
    ...getInventoryMetaForImage(row.id),
  };
}

export const GalleryProvider = ({ children }) => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Initial load
  const load = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from(TABLE)
      .select("id,title,category,description,storage_path,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gallery load error:", error);
      setGalleryImages([]);
      setLoading(false);
      return;
    }

    setGalleryImages((data || []).map(mapRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // 2) Optional realtime (bonus, not required)
  useEffect(() => {
    const channel = supabase
      .channel("gallery_images_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLE },
        () => {
          // If realtime is enabled, keep in sync.
          // (Even if it's not enabled, our optimistic updates still work.)
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  // 3) Add: upload file -> insert row -> UPDATE STATE immediately
  const addImage = useCallback(async (imageData) => {
    const { file, title, category, description, stockQuantity, stockStatus, price } = imageData ?? {};

    if (!file) throw new Error("Липсва файл за качване.");
    if (!title || !title.trim()) throw new Error("Липсва заглавие.");
    if (!category || !category.trim()) throw new Error("Липсва категория.");

    const storagePath = `gallery/${uniqueId()}_${safeFileName(file.name)}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        upsert: false,
        cacheControl: "3600",
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error("Грешка при качване в Supabase Storage.");
    }

    // Insert metadata
    const { data: inserted, error: insertError } = await supabase
      .from(TABLE)
      .insert({
        title: title.trim(),
        category: category.trim(),
        description: typeof description === "string" ? description.trim() : "",
        storage_path: storagePath,
      })
      .select("id,title,category,description,storage_path,created_at")
      .single();

    if (insertError) {
      // rollback file
      await supabase.storage.from(BUCKET).remove([storagePath]);
      console.error("Supabase insert error:", insertError);
      throw new Error("Грешка при запис на метаданни в Supabase DB.");
    }

    const mapped = mapRow(inserted);
    const inventoryMeta = saveInventoryMetaForImage(inserted.id, {
      stockQuantity,
      stockStatus,
      price,
    });

    // ✅ IMPORTANT: update state immediately (no refresh needed)
    setGalleryImages((prev) => [{ ...mapped, ...inventoryMeta }, ...prev]);

    return { ...mapped, ...inventoryMeta };
  }, []);

  // 4) Update: update row -> UPDATE STATE immediately
  const updateImage = useCallback(async (id, updatedData) => {
    if (!id) return;

    const payload = {};
    if (typeof updatedData?.title === "string") payload.title = updatedData.title.trim();
    if (typeof updatedData?.category === "string") payload.category = updatedData.category.trim();
    if (typeof updatedData?.description === "string")
      payload.description = updatedData.description.trim();

    const hasInventoryFields =
      Object.prototype.hasOwnProperty.call(updatedData ?? {}, "stockQuantity") ||
      Object.prototype.hasOwnProperty.call(updatedData ?? {}, "stockStatus") ||
      Object.prototype.hasOwnProperty.call(updatedData ?? {}, "price");

    if (Object.keys(payload).length === 0 && !hasInventoryFields) return;

    let mappedFromDb = null;

    if (Object.keys(payload).length > 0) {
      const { data, error } = await supabase
        .from(TABLE)
        .update(payload)
        .eq("id", id)
        .select("id,title,category,description,storage_path,created_at")
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error("Грешка при редакция.");
      }

      mappedFromDb = mapRow(data);
    }

    const currentImage = galleryImages.find((x) => x.id === id);
    const inventoryMeta = hasInventoryFields
      ? saveInventoryMetaForImage(id, {
          stockQuantity: updatedData?.stockQuantity ?? currentImage?.stockQuantity,
          stockStatus: updatedData?.stockStatus ?? currentImage?.stockStatus,
          price: updatedData?.price ?? currentImage?.price,
        })
      : null;

    // ✅ update state
    setGalleryImages((prev) =>
      prev.map((x) =>
        x.id === id
          ? {
              ...x,
              ...(mappedFromDb ?? {}),
              ...(inventoryMeta ?? {}),
            }
          : x
      )
    );

    return {
      ...(currentImage ?? {}),
      ...(mappedFromDb ?? {}),
      ...(inventoryMeta ?? {}),
    };
  }, [galleryImages]);

  // 5) Delete: delete row -> REMOVE FROM STATE immediately -> best-effort delete file
  const deleteImage = useCallback(async (id) => {
    if (!id) return;

    // find path from current state
    const current = galleryImages.find((x) => x.id === id);
    const storagePath = current?.storagePath;

    // delete row
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) {
      console.error("Supabase delete row error:", error);
      throw new Error("Грешка при изтриване.");
    }

    removeInventoryMetaForImage(id);

    // ✅ remove from state instantly
    setGalleryImages((prev) => prev.filter((x) => x.id !== id));

    // best-effort delete file
    if (storagePath) {
      const { error: removeError } = await supabase.storage.from(BUCKET).remove([storagePath]);
      if (removeError) console.warn("Supabase storage remove failed:", removeError);
    }
  }, [galleryImages]);

  const value = useMemo(
    () => ({
      galleryImages,
      loading,
      addImage,
      updateImage,
      deleteImage,
      reloadGallery: load, // optional helper
    }),
    [galleryImages, loading, addImage, updateImage, deleteImage, load]
  );

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
};
