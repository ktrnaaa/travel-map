import './App.css';
import React from 'react';
import MapView from './components/MapView';
import SupportButton from './components/support/supportButton';
import SupportModal from './components/support/supportModal';
import useSupportModal from './components/support/useSupportModal'; // Підключаємо хук
import Announcements from './components/announcements/announcements';


function App() {
  const { showSupport, toggleSupportModal } = useSupportModal(); // Використовуємо хук

  return (
    <div className="map-container">
      <MapView className="map-view" />
      <Announcements />
      <SupportButton onClick={toggleSupportModal} />
      
      
      {showSupport && (
        <SupportModal onClose={toggleSupportModal} />
      )}
    </div>
  );
}

export default App;
