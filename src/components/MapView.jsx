import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Підключаємо стилі для Leaflet

const MapView = () => {
  const mapRef = useRef(null); // Створюємо посилання на DOM-елемент мапи
  const [weatherData, setWeatherData] = useState(null); // Створюємо стан для збереження погодних шарів
  const [mapType, setMapType] = useState('standard'); // Стан для типу карти
  const mapInstance = useRef(null); // Ссылка на экземпляр карты

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

  // Виконується при монтуванні компонента або при зміні weatherData чи mapType
  useEffect(() => {
    if (!mapInstance.current) {
      // Ініціалізуємо мапу та встановлюємо початковий вигляд (Київ)
      mapInstance.current = L.map(mapRef.current).setView([50.4501, 30.5236], 10);
    }

    const map = mapInstance.current;

    // Удаляем все слои перед добавлением нового
    map.eachLayer((layer) => map.removeLayer(layer));

    // Додаємо шар в залежності від обраного типу карти
    if (mapType === 'standard') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
      }).addTo(map);
    } else if (mapType === 'satellite') {
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
      });
      const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        pane: 'overlayPane',
      });
      satellite.addTo(map);
      labels.addTo(map);
    } else if (mapType === 'topographic') {
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '',
      }).addTo(map);
    }

    // Додаємо погодні шари, якщо вони є
    if (weatherData) {
      L.tileLayer(weatherData.rainLayer, { opacity: 0.8 }).addTo(map);
      L.tileLayer(weatherData.cloudsLayer, { opacity: 0.6 }).addTo(map);
      L.tileLayer(weatherData.tempLayer, { opacity: 0 }).addTo(map);
    }

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
  }, [weatherData, mapType]); // Залежності — weatherData та mapType
  
  return (
    <div>
      <div
        ref={mapRef}
        className="w-auto h-screen">
      </div>
      
      <div
        className="absolute top-4 right-4 flex flex-col space-y-2 z-10"
        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000 }}
      >
        <button onClick={() => setMapType('standard')} className="px-4 py-2 bg-blue-500 text-white rounded">
          Стандартна
        </button>
        <button onClick={() => setMapType('satellite')} className="px-4 py-2 bg-blue-500 text-white rounded">
          Супутникова
        </button>
        <button onClick={() => setMapType('topographic')} className="px-4 py-2 bg-blue-500 text-white rounded">
          Топографічна
        </button>
      </div>
    </div>
  );
};

export default MapView;