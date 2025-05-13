// components/support/SupportModalWrapper.js
import { useState } from 'react';

import useTheme from './hooks/useTheme';
import SupportButton from './supportButton';
import SupportModal from './supportModal';

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
        <SupportModal onClose={toggleSupportModal} toggleTheme={toggleTheme} currentTheme={theme} />
      )}
    </>
  );
}
