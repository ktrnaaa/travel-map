import './App.css';
import React from 'react';

import Announcements from './components/announcements/announcements.jsx';
import MapView from './components/MapView.jsx';
import SupportButton from './components/support/supportButton.jsx';
import SupportModal from './components/support/supportModal.jsx';
import useSupportModal from './components/support/useSupportModal.jsx'; // Підключаємо хук

function App() {
  const { showSupport, toggleSupportModal } = useSupportModal(); // Використовуємо хук

  return (
    <div className="map-container">
      <MapView className="map-view" />
      <Announcements />
      <SupportButton onClick={toggleSupportModal} />
      {showSupport && <SupportModal onClose={toggleSupportModal} />}
    </div>
  );
}

export default App;
