export const GALLERY_INVENTORY_STORAGE_KEY = "gallery_inventory_meta_v1";

export const STOCK_STATUS_OPTIONS = [
  "В наличност",
  "Ограничена наличност",
  "По поръчка",
  "Изчерпан",
];

function normalizeQuantity(value) {
  if (value === null || value === undefined || value === "") return "";

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return "";

  return String(parsed);
}

function normalizePrice(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeStatus(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return STOCK_STATUS_OPTIONS.includes(trimmed) ? trimmed : "";
}

export function normalizeInventoryMeta(meta = {}) {
  return {
    stockQuantity: normalizeQuantity(meta.stockQuantity),
    stockStatus: normalizeStatus(meta.stockStatus),
    price: normalizePrice(meta.price),
  };
}

export function readGalleryInventoryMap() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(GALLERY_INVENTORY_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    return Object.fromEntries(
      Object.entries(parsed).map(([id, value]) => [id, normalizeInventoryMeta(value)])
    );
  } catch (error) {
    console.warn("Gallery inventory metadata read failed:", error);
    return {};
  }
}

function writeGalleryInventoryMap(map) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GALLERY_INVENTORY_STORAGE_KEY, JSON.stringify(map));
}

export function getInventoryMetaForImage(id) {
  const map = readGalleryInventoryMap();
  return normalizeInventoryMeta(map[id]);
}

export function saveInventoryMetaForImage(id, meta) {
  if (!id) return normalizeInventoryMeta(meta);

  const map = readGalleryInventoryMap();
  const nextMeta = normalizeInventoryMeta(meta);

  map[id] = nextMeta;
  writeGalleryInventoryMap(map);

  return nextMeta;
}

export function removeInventoryMetaForImage(id) {
  if (!id) return;

  const map = readGalleryInventoryMap();
  delete map[id];
  writeGalleryInventoryMap(map);
}
