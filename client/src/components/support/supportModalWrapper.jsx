// components/support/SupportModalWrapper.js
import { useState } from 'react';

import ContactSupport from './ContactSupport'; // Обновленный импорт
import useTheme from './hooks/useTheme';
import SupportModal from './supportModal';

export default function SupportModalWrapper() {
  const [showSupport, setShowSupport] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleSupportModal = () => {
    setShowSupport(prev => !prev);
  };

  const telegramLink = 'https://t.me/TM44GRAMMYBOT'; // Замените на вашу ссылку

  return (
    <>
      <ContactSupport onOpenForm={toggleSupportModal} telegramLink={telegramLink} />

      {showSupport && (
        <SupportModal onClose={toggleSupportModal} toggleTheme={toggleTheme} currentTheme={theme} />
      )}
    </>
  );
}
