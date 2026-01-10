import { useState } from 'react';
import { useGallery } from '../context/GalleryContext';
import { useAuth } from '../context/AuthContext';
import './Gallery.css';
import Modal from './Modal';
import AdminGalleryPanel from './AdminGalleryPanel';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('Всички');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const { galleryImages } = useGallery();
  const { user } = useAuth();

  const categories = [
    'Всички', 
    'Индустриални врати', 
    'Гаражни врати', 
    'Автоматични врати', 
    'Противопожарни врати', 
    'Входни врати', 
    'Дворни врати / Портали'
  ];

  // Дефинираме 6-те основни категории с техните снимки и информация
  const mainCategories = [
    {
      id: 1,
      category: 'Индустриални врати',
      title: 'Индустриални врати',
      subtitle: 'Секционни индустриални врати',
      description: 'Висококачествени секционни врати за индустриални и складови нужди',
      image: 'https://indoorsbg.com/wp-content/uploads/2022/04/ind-11.jpg' // Заместваш с реалния път
    },
    {
      id: 2,
      category: 'Гаражни врати',
      title: 'Гаражни врати',
      subtitle: 'Гаражни секционни врати',
      description: 'Специално проектирани врати за гаражи и частни обекти',
      image: 'https://teamdoors.com/wp-content/uploads/2024/07/71.webp'
    },
    {
      id: 3,
      category: 'Автоматични врати',
      title: 'Автоматични врати',
      subtitle: 'Модерни автоматични системи',
      description: 'Напълно автоматизирани врати с дистанционно управление',
      image: 'https://bg.all.biz/img/bg/catalog/94124.jpeg'
    },
    {
      id: 4,
      category: 'Противопожарни врати',
      title: 'Противопожарни врати',
      subtitle: 'Противопожарни защитни системи',
      description: 'Врати с висока степен на пожарна безопасност и защита',
      image: 'https://goliamata-vrata.com/wp-content/uploads/2020/04/protivopojarna-vrata.jpg'
    },
    {
      id: 5,
      category: 'Входни врати',
      title: 'Входни врати',
      subtitle: 'Елегантни входни врати',
      description: 'Качествени входни врати за офиси, магазини и жилищни сгради',
      image: 'https://www.arcoma-bg.com/wp-content/uploads/2019/07/SteelSafeRC3_C1_farbaAntracyt_szyldSafe_pochwytProsty_arn_Porta_RN.jpg'
    },
    {
      id: 6,
      category: 'Дворни врати / Портали',
      title: 'Дворни врати / Портали',
      subtitle: 'Врати и портали за дворове',
      description: 'Здрави и сигурни врати за външни пространства и дворове',
      image: 'https://www.metalni.net/izobrajeniq/vrati/obraboteni/safe%20for%20web/metalna-portalna-vrata-38.jpg'
    }
  ];

  const filteredImages = selectedCategory === 'Всички' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === selectedCategory);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handleNextImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrevImage = () => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  return (
    <>
      <section id="gallery" className="gallery">
        <div className="container">
          <div className="gallery-header">
            <h2 className="section-title">Галерия с продукти</h2>
            <p className="gallery-subtitle">
              Разгледайте нашата галерия с индустриални и гаражни врати
            </p>
            
            {/* Бутон за администратори */}
            {user && user.role === 'admin' && (
              <div className="admin-controls">
                <button 
                  className="admin-btn"
                  onClick={() => setIsAdminPanelOpen(true)}
                >
                  🛠️ Управление на галерията
                </button>
              </div>
            )}
          </div>

          <div className="gallery-filter">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Показваме 6-те основни категории като отделни снимки */}
          {selectedCategory === 'Всички' && (
            <div className="gallery-grid"> 
              {mainCategories.map((categoryItem) => (
                <div 
                  key={categoryItem.id}
                  className="gallery-item"
                  onClick={() => handleCategoryClick(categoryItem.category)}
                >
                  <div className="gallery-image-container">
                    <img 
                      src={categoryItem.image} 
                      alt={categoryItem.title}
                      loading="lazy"
                    />
                    <div className="gallery-overlay">
                      <div className="gallery-info">
                        <h3>{categoryItem.title}</h3>
                        <p>{categoryItem.subtitle}</p>
                        <p className="description">{categoryItem.description}</p>
                        <span className="view-btn">Научи повече</span>
                      </div>
                    </div>
                  </div>
                  <div className="gallery-category">{categoryItem.category}</div>
                </div>
              ))}
            </div>
          )}

          {/* Показваме филтрираните снимки когато е избрана категория */}
          {selectedCategory !== 'Всички' && (
            <div className="gallery-grid">
              {filteredImages.map((image) => (
                <div 
                  key={image.id} 
                  className="gallery-item"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="gallery-image-container">
                    <img 
                      src={image.src} 
                      alt={image.title}
                      loading="lazy"
                    />
                    <div className="gallery-overlay">
                      <div className="gallery-info">
                        <h3>{image.title}</h3>
                        <p>{image.description}</p>
                        <span className="view-btn">Научи повече</span>
                      </div>
                    </div>
                  </div>
                  <div className="gallery-category">{image.category}</div>
                </div>
              ))}
            </div>
          )}

          {selectedCategory !== 'Всички' && filteredImages.length === 0 && (
            <div className="no-images">
              <p>Няма налични снимки за тази категория.</p>
            </div>
          )}
        </div>
      </section>

      {/* Модал за голямо изображение */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedImage?.title}
        size="large"
      >
        {selectedImage && (
          <div className="image-modal-content">
            <div className="image-container">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title}
                className="modal-image"
              />
              
              <button className="nav-btn prev-btn" onClick={handlePrevImage}>
                ‹
              </button>
              <button className="nav-btn next-btn" onClick={handleNextImage}>
                ›
              </button>
            </div>
            
            <div className="image-details">
              <div className="detail-item">
                <strong>Категория:</strong>
                <span>{selectedImage.category}</span>
              </div>
              <div className="detail-item">
                <strong>Описание:</strong>
                <p>{selectedImage.description}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn" onClick={closeModal}>
                Затвори
              </button>
              <a href="#contact" className="btn btn-outline" onClick={closeModal}>
                Запитване за продукт
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Администраторски панел */}
      <Modal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        title="Администраторски панел"
        size="large"
      >
        <AdminGalleryPanel onClose={() => setIsAdminPanelOpen(false)} />
      </Modal>
    </>
  );
};

export default Gallery;