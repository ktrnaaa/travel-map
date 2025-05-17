import React from 'react';

import Announcements from './components/announcements/announcementModalWrapper';
import MapView from './components/MapView';
import SupportModalWrapper from './components/support/supportModalWrapper';

import './App.css';

function App() {
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50">
      <MapView />
      <Announcements />
      <SupportModalWrapper />
    </div>
  );
}

export default App;
