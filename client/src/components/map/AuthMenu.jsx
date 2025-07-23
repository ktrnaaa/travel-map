import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AuthMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Обработчик клика вне компонента для закрытия меню
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleLogin = () => {
    // Логика для авторизации
    console.log('Открытие окна авторизации');
    setIsOpen(false);
  };

  const handleRegister = () => {
    // Логика для регистрации
    console.log('Открытие окна регистрации');
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Основная иконка пользователя */}
      <button
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg
                  hover:bg-gray-100 transition-all duration-300 z-20 relative"
        onClick={() => navigate('/login')}
      >
        <FaUser className="text-2xl text-gray-700" />
      </button>

      {/* Выпадающее меню при клике */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[200px] z-10">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Приватний кабінет</h3>
              </div>

              <button
                onClick={handleLogin}
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <FaSignInAlt className="text-indigo-600" />
                <span>Авторизація</span>
              </button>

              <button
                onClick={handleRegister}
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <FaUserPlus className="text-green-600" />
                <span>Реєстрація</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthMenu;
