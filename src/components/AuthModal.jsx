import { useState } from 'react';
import Modal from './Modal';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('login');

  const handleClose = () => {
    setCurrentView('login');
    onClose();
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={currentView === 'login' ? 'Вход в системата' : 'Регистрация'}
      size="small"
    >
      {currentView === 'login' ? (
        <Login 
          onClose={handleClose} 
          switchToRegister={switchToRegister}
        />
      ) : (
        <Register 
          onClose={handleClose} 
          switchToLogin={switchToLogin}
        />
      )}
    </Modal>
  );
};

export default AuthModal;
