import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Announcements from './components/announcements/announcementModalWrapper';
import SearchBar from './components/announcements/SearchBar';
import MapView from './components/MapView';
import SidebarLayout from './components/sidebarLayout/sidebarLayout';
import SupportModalWrapper from './components/support/supportModalWrapper';
import ProfilePage from './pages/profilePage';

function App() {
  const location = useLocation();

  const inDashboard =
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/settings') ||
    location.pathname.startsWith('/announcements') ||
    location.pathname.startsWith('/support') ||
    location.pathname.startsWith('/routes');

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 relative">
      {!inDashboard && (
        <>
          <MapView />
          <SupportModalWrapper />
          <Announcements />
          <SearchBar />
        </>
      )}

      <Routes>
        {/* Главная страница с MapView и UI-элементами */}
        <Route path="/" element={<div />} />

        {/* Личный кабинет */}
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

        {/* Пример авторизации */}
        <Route path="/login" element={<div>Логін</div>} />
      </Routes>
    </div>
  );
}

export default App;