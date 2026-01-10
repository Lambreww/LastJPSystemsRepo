import { useState } from 'react';
import './CallToAction.css';
import Modal from './Modal';

const CallToAction = () => {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const managers = [
    {
      name: 'Йордан Ламбрев',
      position: 'Управител',
      phone: '0898543423',
      image: '👨‍💼',
      description: 'Отговорен за производството и техническите въпроси'
    },
    {
      name: 'Петко Карараев', 
      position: 'Управител',
      phone: '0898660331',
      image: '👨‍💼',
      description: 'Отговорен за продажбите и клиентските отношения'
    }
  ];

  const handleCallNow = () => {
    setIsCallModalOpen(true);
  };

  const closeCallModal = () => {
    setIsCallModalOpen(false);
  };

  const handlePhoneClick = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <>
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Готови ли сте да започнете вашия проект?</h2>
            <p>Свържете се с нас за безплатна консултация и оферта</p>
            <div className="cta-buttons">
              <a href="#contact" className="btn btn-large">Получете оферта</a>
              <button 
                className="btn btn-outline btn-large" 
                onClick={handleCallNow}
              >
                Обадете се сега
              </button>
            </div>
          </div>
        </div>
      </section>

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

export default CallToAction;