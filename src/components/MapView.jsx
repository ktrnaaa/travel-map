import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Підключаємо стилі для Leaflet

const MapView = () => {
  const mapRef = useRef(null); // Створюємо посилання на DOM-елемент мапи
  const [weatherData, setWeatherData] = useState(null); // Створюємо стан для збереження погодних шарів

  const apiKey = '53f660d63998c9aff94a039be901d2ba'; // API ключ для OpenWeatherMap

  // Функція для отримання URL погодних шарів
  const getWeatherData = () => {
    try {
      // Посилання на шари: дощ, хмари, температура
      const rainLayer = `https://tile.openweathermap.org/map/rain_new/{z}/{x}/{y}.png?appid=${apiKey}`;
      const cloudsLayer = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`;
      const tempLayer = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`;

      // Зберігаємо посилання на шари у стан
      setWeatherData({ rainLayer, cloudsLayer, tempLayer });
    } catch (error) {
      // Виводимо помилку в консоль, якщо щось пішло не так
      console.error('Помилка отримання погодних шарів:', error);
    }
  };

  // Виконується при монтуванні компонента або при зміні weatherData
  useEffect(() => {
    if (weatherData) {
      // Ініціалізуємо мапу та встановлюємо початковий вигляд (Київ)
      const map = L.map(mapRef.current).setView([50.4501, 30.5236], 10);

      // Стандартна
      /*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);*/
      
      // Супутник + підписи
/*const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri'
});

// Підписи
const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Labels &copy; Esri',
  pane: 'overlayPane'
});

// Добавляємо обидва
satellite.addTo(map);
labels.addTo(map);*/
      
      // Топографічна
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; OpenTopoMap'
}).addTo(map);
      
      // Додаємо погодні шари: дощ, хмари, температура
      L.tileLayer(weatherData.rainLayer, { opacity: 0.8 }).addTo(map);
      L.tileLayer(weatherData.cloudsLayer, { opacity: 0.6 }).addTo(map);
      L.tileLayer(weatherData.tempLayer, { opacity: 0 }).addTo(map);

      // Додаємо маркер в центрі Києва
      L.marker([50.4501, 30.5236]).addTo(map).bindPopup('Центр Києва');

      // ➕ Додаємо можливість ставити нові маркери при кліку на мапу
      map.on('click', (e) => {
        const { lat, lng } = e.latlng; // Отримуємо координати кліку
        L.marker([lat, lng]) // Створюємо новий маркер
          .addTo(map) // Додаємо його на мапу
          .bindPopup('Новий маркер') // Встановлюємо підказку
          .openPopup(); // Відкриваємо підказку автоматично
      });
    } else {
      // Якщо weatherData ще немає — викликаємо функцію для його отримання
      getWeatherData();
    }
  }, [weatherData]); // Залежність — weatherData

  // Повертаємо контейнер для карти з фіксованою висотою
  return (
    <div ref={mapRef} style={{ width: '100%', height: '800px' }}>
    
    </div>
);
};

export default MapView;
