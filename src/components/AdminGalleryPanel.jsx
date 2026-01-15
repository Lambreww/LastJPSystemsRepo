import { useEffect, useMemo, useRef, useState } from "react";
import { useGallery } from "../context/GalleryContext";
import "./AdminGalleryPanel.css";

const CATEGORIES = [
  "Индустриални врати",
  "Гаражни врати",
  "Автоматични врати",
  "Противопожарни врати",
  "Входни врати",
  "Дворни врати / Портали",
];

const MAX_MB = 10;

export default function AdminGalleryPanel() {
  const { galleryImages, addImage, updateImage, deleteImage, loading } = useGallery();

  const fileInputRef = useRef(null);

  const [newImage, setNewImage] = useState({
    title: "",
    category: CATEGORIES[0],
    description: "",
    file: null,
  });

  const [previewSrc, setPreviewSrc] = useState("");

  // per-action busy (по-добро от един глобален busy)
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState(null); // update
  const [deletingId, setDeletingId] = useState(null); // delete

  // editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: CATEGORIES[0],
    description: "",
  });

  // UI helpers
  const [queryText, setQueryText] = useState("");
  const [filterCategory, setFilterCategory] = useState("Всички");

  const canAdd = useMemo(() => {
    return !!newImage.file && !!newImage.title.trim() && !!newImage.category.trim();
  }, [newImage]);

  const filteredImages = useMemo(() => {
    const q = queryText.trim().toLowerCase();

    return (galleryImages || []).filter((img) => {
      const matchesCategory = filterCategory === "Всички" ? true : img.category === filterCategory;

      if (!q) return matchesCategory;

      const hay = `${img.title || ""} ${img.category || ""} ${img.description || ""}`.toLowerCase();
      return matchesCategory && hay.includes(q);
    });
  }, [galleryImages, queryText, filterCategory]);

  useEffect(() => {
    // cleanup objectURL
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // basic validation
    if (!file.type?.startsWith("image/")) {
      alert("Моля, избери валиден image файл.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Файлът е твърде голям. Максимум ${MAX_MB}MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // cleanup previous preview
    if (previewSrc) URL.revokeObjectURL(previewSrc);

    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);
    setNewImage((prev) => ({ ...prev, file }));
  };

  const resetAddForm = () => {
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    setPreviewSrc("");

    setNewImage({
      title: "",
      category: CATEGORIES[0],
      description: "",
      file: null,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddImage = async () => {
    if (!canAdd || adding) return;

    setAdding(true);
    try {
      await addImage({
        file: newImage.file,
        title: newImage.title,
        category: newImage.category,
        description: newImage.description,
      });

      resetAddForm();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Грешка при добавяне на снимката.");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (img) => {
    setEditingId(img.id);
    setEditForm({
      title: img.title || "",
      category: img.category || CATEGORIES[0],
      description: img.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: "",
      category: CATEGORIES[0],
      description: "",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    if (!editForm.title.trim()) {
      alert("Заглавието не може да е празно.");
      return;
    }

    setSavingId(editingId);
    try {
      await updateImage(editingId, {
        title: editForm.title,
        category: editForm.category,
        description: editForm.description,
      });
      cancelEdit();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Грешка при редакция.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (img) => {
    if (deletingId) return;

    const ok = confirm(`Сигурен ли си, че искаш да изтриеш "${img.title}"?`);
    if (!ok) return;

    setDeletingId(img.id);
    try {
      await deleteImage(img.id);
      if (editingId === img.id) cancelEdit();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Грешка при изтриване.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="agp">
      <div className="agp__header">
        <div>
          <h2>Управление на галерия</h2>
          <p>Добавяй, редактирай и изтривай снимки. Всички потребители ще ги виждат.</p>
        </div>

        <div className="agp__stats">
          <div className="agp__pill">
            <span>Общо:</span> <b>{galleryImages?.length ?? 0}</b>
          </div>
          <div className="agp__pill">
            <span>Показани:</span> <b>{filteredImages.length}</b>
          </div>
        </div>
      </div>

      {/* ADD FORM */}
      <div className="agp__card">
        <div className="agp__cardTitle">
          <h3>Добави нова снимка</h3>
          <span className="agp__hint">PNG/JPG/WebP • до {MAX_MB}MB</span>
        </div>

        <div className="agp__form">
          <div className="agp__row">
            <label>Снимка</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={adding}
            />
          </div>

          {previewSrc && (
            <div className="agp__preview">
              <img src={previewSrc} alt="Preview" loading="lazy" />
            </div>
          )}

          <div className="agp__row">
            <label>Заглавие</label>
            <input
              type="text"
              value={newImage.title}
              onChange={(e) => setNewImage((p) => ({ ...p, title: e.target.value }))}
              placeholder="Напр. Гаражни секционни врати"
              disabled={adding}
            />
          </div>

          <div className="agp__row">
            <label>Категория</label>
            <select
              value={newImage.category}
              onChange={(e) => setNewImage((p) => ({ ...p, category: e.target.value }))}
              disabled={adding}
            >
              {CATEGORIES.map((c) => (
                <option value={c} key={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="agp__row">
            <label>Описание</label>
            <textarea
              rows={3}
              value={newImage.description}
              onChange={(e) => setNewImage((p) => ({ ...p, description: e.target.value }))}
              placeholder="Кратко описание..."
              disabled={adding}
            />
          </div>

          <div className="agp__actions">
            <button className="agp__btn agp__btn--primary" onClick={handleAddImage} disabled={!canAdd || adding}>
              {adding ? "Качване..." : "Добави"}
            </button>
            <button className="agp__btn" onClick={resetAddForm} disabled={adding}>
              Изчисти
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="agp__card">
        <div className="agp__cardTitle agp__cardTitle--split">
          <h3>Снимки в галерията</h3>

          <div className="agp__toolbar">
            <input
              className="agp__search"
              placeholder="Търси (заглавие, категория, описание)…"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
            />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="Всички">Всички</option>
              {CATEGORIES.map((c) => (
                <option value={c} key={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="agp__empty">Зареждане...</div>
        ) : filteredImages.length === 0 ? (
          <div className="agp__empty">Няма снимки по този филтър.</div>
        ) : (
          <div className="agp__grid">
            {filteredImages.map((img) => {
              const isEditing = editingId === img.id;
              const isSaving = savingId === img.id;
              const isDeleting = deletingId === img.id;

              return (
                <div className="agp__item" key={img.id}>
                  <div className="agp__thumb">
                    <img
                      src={img.src || ""}
                      alt={img.title || "Gallery"}
                      loading="lazy"
                      onError={(e) => {
                        // ако URL е празен/невалиден, поне да не чупи layout
                        e.currentTarget.style.opacity = "0.25";
                      }}
                    />
                  </div>

                  {!isEditing ? (
                    <>
                      <div className="agp__meta">
                        <div className="agp__title">{img.title}</div>
                        <div className="agp__cat">{img.category}</div>
                        {img.description ? <div className="agp__desc">{img.description}</div> : null}
                      </div>

                      <div className="agp__itemActions">
                        <button className="agp__btn" onClick={() => startEdit(img)} disabled={adding || isDeleting}>
                          Редакция
                        </button>
                        <button
                          className="agp__btn agp__btn--danger"
                          onClick={() => handleDelete(img)}
                          disabled={adding || isDeleting}
                        >
                          {isDeleting ? "Триене..." : "Изтрий"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="agp__edit">
                      <div className="agp__row">
                        <label>Заглавие</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                          disabled={isSaving || isDeleting}
                        />
                      </div>

                      <div className="agp__row">
                        <label>Категория</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                          disabled={isSaving || isDeleting}
                        >
                          {CATEGORIES.map((c) => (
                            <option value={c} key={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="agp__row">
                        <label>Описание</label>
                        <textarea
                          rows={3}
                          value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          disabled={isSaving || isDeleting}
                        />
                      </div>

                      <div className="agp__itemActions">
                        <button
                          className="agp__btn agp__btn--primary"
                          onClick={saveEdit}
                          disabled={isSaving || isDeleting}
                        >
                          {isSaving ? "Запис..." : "Запази"}
                        </button>
                        <button className="agp__btn" onClick={cancelEdit} disabled={isSaving || isDeleting}>
                          Отказ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}