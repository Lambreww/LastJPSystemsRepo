import { useState, useRef } from 'react';
import { useGallery } from '../context/GalleryContext';
import { useAuth } from '../context/AuthContext';
import './AdminGalleryPanel.css';

const AdminGalleryPanel = ({ onClose }) => {
  const { galleryImages, addImage, deleteImage, updateImage } = useGallery();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('manage');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Всички');
  const fileInputRef = useRef(null);

  const [newImage, setNewImage] = useState({
    title: '',
    category: 'Индустриални врати',
    description: ''
  });

  // Актуализирани категории според новите изисквания
  const categories = [
    'Индустриални врати', 
    'Гаражни врати', 
    'Автоматични врати', 
    'Противопожарни врати', 
    'Входни врати', 
    'Дворни врати / Портали'
  ];

  const allCategories = ['Всички', ...categories];

  // Филтрираме снимките според избраната категория
  const filteredImages = selectedCategory === 'Всички' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === selectedCategory);

  // Проверка дали потребителят е администратор
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h3>🔒 Достъп отказан</h3>
          <p>Само администратори имат достъп до този панел.</p>
        </div>
      </div>
    );
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImage(prev => ({
          ...prev,
          src: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = () => {
    if (!newImage.src || !newImage.title.trim()) {
      alert('Моля, изберете снимка и попълнете заглавие');
      return;
    }

    addImage(newImage);
    setNewImage({
      title: '',
      category: 'Индустриални врати',
      description: '',
      src: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = (id) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази снимка?')) {
      deleteImage(id);
    }
  };

  const handleEditImage = (image) => {
    setSelectedImage({...image});
    setActiveTab('edit');
  };

  const handleUpdateImage = () => {
    if (selectedImage) {
      updateImage(selectedImage.id, {
        title: selectedImage.title,
        category: selectedImage.category,
        description: selectedImage.description
      });
      setSelectedImage(null);
      setActiveTab('manage');
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🎨 Управление на Галерията</h2>
        <p>Администраторски панел за управление на снимките</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Управление на снимки
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Добавяне на снимка
        </button>
      </div>

      {activeTab === 'manage' && (
        <div className="manage-tab">
          <h3>Списък със снимки ({filteredImages.length})</h3>
          
          {/* Филтър по категории */}
          <div className="category-filter">
            <label>Филтрирай по категория:</label>
            <div className="filter-buttons">
              {allCategories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} ({category === 'Всички' ? galleryImages.length : galleryImages.filter(img => img.category === category).length})
                </button>
              ))}
            </div>
          </div>

          {/* Статистика по категории */}
          <div className="categories-stats">
            <h4>Статистика по категории:</h4>
            <div className="stats-grid">
              {categories.map(category => {
                const count = galleryImages.filter(img => img.category === category).length;
                return (
                  <div key={category} className="stat-item">
                    <span className="category-name">{category} - </span>
                    <span className="category-count">{count} снимки</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="images-grid">
            {filteredImages.map((image) => (
              <div key={image.id} className="admin-image-card">
                <div className="image-preview">
                  <img src={image.src} alt={image.title} />
                  <div className="image-category-badge">{image.category}</div>
                </div>
                <div className="image-info">
                  <h4>{image.title}</h4>
                  <p className="description">{image.description}</p>
                  <p className="image-id">ID: {image.id}</p>
                </div>
                <div className="image-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEditImage(image)}
                  >
                    ✏️ Редактирай
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    🗑️ Изтрий
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="no-images">
              <p>
                {selectedCategory === 'Всички' 
                  ? 'Няма добавени снимки в галерията.' 
                  : `Няма снимки в категория "${selectedCategory}".`
                }
              </p>
              <button 
                className="add-first-btn"
                onClick={() => setActiveTab('add')}
              >
                ➕ Добави нова снимка
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="add-tab">
          <h3>Добавяне на нова снимка</h3>
          <div className="add-form">
            <div className="form-group">
              <label>Изберете снимка *</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
              />
              {newImage.src && (
                <div className="image-preview-small">
                  <img src={newImage.src} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Заглавие *</label>
              <input
                type="text"
                value={newImage.title}
                onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Въведете заглавие на снимката"
              />
            </div>

            <div className="form-group">
              <label>Категория *</label>
              <select
                value={newImage.category}
                onChange={(e) => setNewImage(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                value={newImage.description}
                onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Въведете описание на снимката"
                rows="3"
              />
            </div>

            <button 
              className="add-btn"
              onClick={handleAddImage}
              disabled={!newImage.src || !newImage.title.trim()}
            >
              ➕ Добави снимка
            </button>
          </div>
        </div>
      )}

      {activeTab === 'edit' && selectedImage && (
        <div className="edit-tab">
          <h3>Редактиране на снимка</h3>
          <div className="edit-form">
            <div className="current-image">
              <img src={selectedImage.src} alt={selectedImage.title} />
            </div>
            
            <div className="form-group">
              <label>Заглавие *</label>
              <input
                type="text"
                value={selectedImage.title}
                onChange={(e) => setSelectedImage(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Категория</label>
              <select
                value={selectedImage.category}
                onChange={(e) => setSelectedImage(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                value={selectedImage.description}
                onChange={(e) => setSelectedImage(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
              />
            </div>

            <div className="edit-actions">
              <button 
                className="save-btn"
                onClick={handleUpdateImage}
                disabled={!selectedImage.title.trim()}
              >
                💾 Запази промените
              </button>
              <button 
                className="cancel-btn"
                onClick={() => {
                  setSelectedImage(null);
                  setActiveTab('manage');
                }}
              >
                ❌ Откажи
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-actions">
        <button className="close-btn" onClick={onClose}>
          Затвори панела
        </button>
      </div>
    </div>
  );
};

export default AdminGalleryPanel;