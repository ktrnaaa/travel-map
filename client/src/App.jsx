import './App.css';
import React from 'react';
import MapView from './components/MapView';
import SupportButton from './components/support/supportButton';
import SupportModal from './components/support/supportModal';
import { AnimatePresence } from 'framer-motion';
import useSupportModal from './components/support/useSupportModal'; // Підключаємо хук

function App() {
  const { showSupport, toggleSupportModal } = useSupportModal(); // Використовуємо хук

  return (
    <div className="map-container">
      <MapView className="map-view" />
      <SupportButton onClick={toggleSupportModal} />
      
      
      {showSupport && (
        <SupportModal onClose={toggleSupportModal} />
      )}
    </div>
  );
}

export default App;
