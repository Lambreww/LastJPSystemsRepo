import { useState } from 'react';
import './Contact.css';
import Modal from './Modal';
import emailjs from '@emailjs/browser';

const Contact = () => {
  //const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const managers = [
    {
      name: "Йордан Ламбрев",
      position: "Управител",
      phone: "0898543423",
      email: "manager@jpsystems.bg",
      image: "👨‍💼"
    },
    {
      name: "Петко Карараев",
      position: "Управител",
      phone: "0898660331",
      image: "👨‍💼"
    }
  ];

  const handlePhoneClick = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        alert('Липсват EmailJS настройки (.env.local). Провери SERVICE/TEMPLATE/PUBLIC KEY.');
        return;
      }

      // Пращаме директно полетата от формата.
      // В EmailJS template използвай: {{name}}, {{email}}, {{phone}}, {{subject}}, {{message}}
      await emailjs.send(
        serviceId,
        templateId,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        },
        { publicKey }
      );

      alert('Благодарим ви за запитването! Ще се свържем с вас в най-кратки срокове.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('EmailJS error:', err);
      alert('Грешка при изпращане. Моля, опитайте отново.');
    }
  };

  const handleContactAction = (action, value) => {
    switch (action) {
      case 'call':
        window.open(`tel:${value}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${value}`, '_self');
        break;
      default:
        break;
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2 className="section-title">Контакти</h2>

        <div className="contact-content">
          <div className="contact-info-section">
            <div className="contact-managers">
              <h3>Директни контакти с управители</h3>
              <div className="managers-grid">
                {managers.map((manager, index) => (
                  <div key={index} className="manager-contact-card">
                    <div className="manager-avatar">
                      <span className="avatar-icon">{manager.image}</span>
                    </div>
                    <div className="manager-details">
                      <h4>{manager.name}</h4>
                      <p className="manager-position">{manager.position}</p>
                      <p
                        className="manager-contact-item clickable"
                        onClick={() => handleContactAction('call', manager.phone)}
                      >
                        📞 {manager.phone}
                      </p>
                      <p
                        className="manager-contact-item clickable"
                        onClick={() => handleContactAction('email', manager.email)}
                      >

                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="main-contact-info">
              <h3>Основни контакти</h3>
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <h4>Адрес</h4>
                    <p>Пловдив, Тракия, ул.Петър Николов</p>
                  </div>
                </div>
                <div className="contact-item clickable" onClick={() => handlePhoneClick('+359 898543423')}>
                  <span className="contact-icon">📞</span>
                  <div>
                    <h4>Телефон</h4>
                    <p>+359 898543423</p>
                  </div>
                </div>
                <div className="contact-item clickable" onClick={() => handleContactAction('email', 'officejps.bg@gmail.com')}>
                  <span className="contact-icon">✉️</span>
                  <div>
                    <h4>Имейл</h4>
                    <p>officejps.bg@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h3>Изпратете запитване</h3>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Вашето име"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Вашият имейл"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Телефон"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Тема"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Съобщение"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Изпрати
              </button>
            </form>
          </div>
        </div>
      </div>

      
        
      
    </section>
  );
};

export default Contact;
