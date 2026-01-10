import { createContext, useContext, useState, useEffect } from 'react';

const GalleryContext = createContext();

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

export const GalleryProvider = ({ children }) => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Зареждане на снимки от localStorage при стартиране
  useEffect(() => {
    const savedImages = localStorage.getItem('galleryImages');
    if (savedImages) {
      setGalleryImages(JSON.parse(savedImages));
    } else {
      // Начални снимки с НОВИТЕ категории
      const initialImages = [
        {
          id: 1,
          src: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Секционни индустриални врати',
          category: 'Индустриални врати',
          description: 'Висококачествени секционни врати за индустриални и складови нужди'
        },
        {
          id: 2,
          src: 'https://images.unsplash.com/photo-1576013551627-0f20b5260d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Гаражни секционни врати',
          category: 'Гаражни врати',
          description: 'Модерни и сигурни гаражни врати за дома и бизнеса'
        },
        {
          id: 3,
          src: 'https://images.unsplash.com/photo-1558618666-fcd25856cd63?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Автоматични отварящи системи',
          category: 'Автоматични врати',
          description: 'Напълно автоматизирани врати с дистанционно управление'
        },
        {
          id: 4,
          src: 'https://images.unsplash.com/photo-1595421724313-4b04639b0c15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Противопожарни защитни врати',
          category: 'Противопожарни врати',
          description: 'Врати с висока степен на пожарна безопасност и защита'
        },
        {
          id: 5,
          src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Модерни входни врати',
          category: 'Входни врати',
          description: 'Елегантни входни врати за офиси, магазини и жилищни сгради'
        },
        {
          id: 6,
          src: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Дворни портали и врати',
          category: 'Дворни врати / Портали',
          description: 'Здрави и сигурни врати за външни пространства и дворове'
        },
        {
          id: 7,
          src: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Индустриални ролкови врати',
          category: 'Индустриални врати',
          description: 'Специални ролкови врати за индустриални обекти'
        },
        {
          id: 8,
          src: 'https://images.unsplash.com/photo-1576013551627-0f20b5260d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Автоматични гаражни врати',
          category: 'Гаражни врати',
          description: 'Гаражни врати с автоматично отваряне и затваряне'
        },
        {
          id: 9,
          src: 'https://images.unsplash.com/photo-1558618666-fcd25856cd63?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Слънчеви автоматични системи',
          category: 'Автоматични врати',
          description: 'Енергийно ефективни автоматични врати'
        },
        {
          id: 10,
          src: 'https://images.unsplash.com/photo-1595421724313-4b04639b0c15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Противопожарни стоманени врати',
          category: 'Противопожарни врати',
          description: 'Стоманени врати с висока пожарна устойчивост'
        },
        {
          id: 11,
          src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Дизайнерски входни врати',
          category: 'Входни врати',
          description: 'Ексклузивни входни врати с уникален дизайн'
        },
        {
          id: 12,
          src: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          title: 'Двојни дворни портали',
          category: 'Дворни врати / Портали',
          description: 'Широки дворни портали за големи пространства'
        }
      ];
      setGalleryImages(initialImages);
      localStorage.setItem('galleryImages', JSON.stringify(initialImages));
    }
    setLoading(false);
  }, []);

  const addImage = (imageData) => {
    const newImage = {
      id: Date.now(),
      ...imageData
    };
    
    const updatedImages = [...galleryImages, newImage];
    setGalleryImages(updatedImages);
    localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
    return newImage;
  };

  const updateImage = (id, updatedData) => {
    const updatedImages = galleryImages.map(image =>
      image.id === id ? { ...image, ...updatedData } : image
    );
    setGalleryImages(updatedImages);
    localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
  };

  const deleteImage = (id) => {
    const updatedImages = galleryImages.filter(image => image.id !== id);
    setGalleryImages(updatedImages);
    localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
  };

  const value = {
    galleryImages,
    addImage,
    updateImage,
    deleteImage,
    loading
  };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};