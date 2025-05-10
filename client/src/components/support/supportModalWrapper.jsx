// components/support/SupportModalWrapper.js
import { useState } from 'react';
import SupportButton from './supportButton';
import SupportModal from './supportModal';
import useTheme from './hooks/useTheme';

export default function SupportModalWrapper() {
  const [showSupport, setShowSupport] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleSupportModal = () => {
    setShowSupport(prev => !prev);
  };

  return (
    <>
      <SupportButton onClick={toggleSupportModal} />
      
      {showSupport && (
        <SupportModal 
          onClose={toggleSupportModal} 
          toggleTheme={toggleTheme}
          currentTheme={theme}
        />
      )}
    </>
  );
}