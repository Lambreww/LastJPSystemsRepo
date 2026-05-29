import { useState } from 'react';
import './Services.css';
import Modal from './Modal';

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false); // Нов state за call модала

  const managers = [
    {
      name: 'Йордан Ламбрев',
      position: 'Управител',
      phone: '0898543423',
      image: '👨‍💼',
      description: 'Отговорен за производството, техническите въпроси и клиентските отношения'
    },
    {
      name: 'Петко Карараев', 
      position: 'Управител',
      phone: '0898660331',
      image: '👨‍💼',
      description: 'Отговорен за обекти, монтажи и ремонти'
    }
  ];

  const handleCallNow = () => {
    setIsCallModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const closeCallModal = () => {
    setIsCallModalOpen(false);
  };

  const handlePhoneClick = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <>
      <section id="services" className="services">
        <div className="container">
          {/* ... останалия JSX код остава същия ... */}
          
          <div className="services-cta">
            <div className="cta-content">
              <h3>Имате нужда от професионални услуги?</h3>
              <p>Свържете се с нас за безплатна консултация и оферта</p>
              <div className="cta-buttons">
                <a href="#contact" className="btn">Свържете се с нас</a>
                <button 
                  className="btn btn-outline" 
                  onClick={handleCallNow}
                >
                  Обадете се сега
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Модал за услугите */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedService?.title}
      >
        {/* ... съдържанието на услугите модал остава същото ... */}
      </Modal>

      {/* Модал за обаждане */}
      <Modal
        isOpen={isCallModalOpen}
        onClose={closeCallModal}
        title="Обадете се сега"
      >
        <div className="call-modal-content">
          <div className="call-intro">
            <p>Свържете се директно с нашите управители за бърза консултация и оферта:</p>
          </div>
          
          <div className="managers-list">
            {managers.map((manager, index) => (
              <div key={index} className="manager-card">
                <div className="manager-avatar">
                  <span className="avatar-icon">{manager.image}</span>
                </div>
                
                <div className="manager-info">
                  <h3>{manager.name}</h3>
                  <p className="manager-position">{manager.position}</p>
                  <p className="manager-description">{manager.description}</p>
                  
                  <div className="manager-contact">
                    <button 
                      className="phone-btn"
                      onClick={() => handlePhoneClick(manager.phone)}
                    >
                      <span className="phone-icon">📞</span>
                      {manager.phone}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="call-notes">
            <div className="note-item">
              <span className="note-icon">⏰</span>
              <span>Работно време: Пон-Пет 8:00 - 18:00</span>
            </div>
            <div className="note-item">
              <span className="note-icon">💬</span>
              <span>Можете да ни изпратите и съобщение през контактната форма</span>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn" onClick={closeCallModal}>
              Затвори
            </button>
            <a href="#contact" className="btn btn-outline" onClick={closeCallModal}>
              Изпрати съобщение
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Services;
