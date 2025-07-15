import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Announcements from './components/announcements/announcementModalWrapper';
import SearchBar from './components/announcements/SearchBar';
import MapView from './components/MapView';
import SidebarLayout from './components/sidebarLayout/sidebarLayout';
import SupportModalWrapper from './components/support/supportModalWrapper';
import LoginPage from './pages/login/LoginPage';
import ProfilePage from './pages/profilePage';

function App() {
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 relative">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <MapView />
              <SupportModalWrapper />
              {/*<Announcements />*/}
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <SidebarLayout>
              <ProfilePage />
            </SidebarLayout>
          }
        />
        <Route
          path="/announcements"
          element={
            <SidebarLayout>
              <div>Оголошення</div>
            </SidebarLayout>
          }
        />
        <Route
          path="/routes"
          element={
            <SidebarLayout>
              <div>Маршрути</div>
            </SidebarLayout>
          }
        />
        <Route
          path="/support"
          element={
            <SidebarLayout>
              <div>Підтримка</div>
            </SidebarLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <SidebarLayout>
              <div>Налаштування</div>
            </SidebarLayout>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;
