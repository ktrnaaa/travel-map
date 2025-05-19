import React from 'react';

import Announcements from './components/announcements/announcementModalWrapper';
import SearchBar from './components/announcements/SearchBar';
import MapView from './components/MapView';
import SupportModalWrapper from './components/support/supportModalWrapper';

import './App.css';

function App() {
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50">
      <MapView />
      <SearchBar />
      <Announcements />
      <SupportModalWrapper />
    </div>
  );
}

export default App;
