import React from 'react';
import './App.css';
import MapView from './components/MapView';
import Announcements from './components/announcements/Announcements';
import SupportModalWrapper from './components/support/supportModalWrapper';

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
