import axios from 'axios';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';

const MapView = () => {
  const mapRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const mapInstance = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [routeLayer, setRouteLayer] = useState(null);
  const [routeInfoControl, setRouteInfoControl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Стейт для модального вікна і даних маркерів
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    files: [],
  });
  const [selectedMarker, setSelectedMarker] = useState(null);

  // API ключі
  const weatherApiKey = '53f660d63998c9aff94a039be901d2ba';
  const graphHopperApiKey = '172690f6-9d12-43a0-868f-a33d3154e508';
  const weatherLayersApiKey = 'tXqVwo5dNRn5uaNDKEJM';

  // Функція для отримання URL погодних шарів
  const getWeatherData = () => {
    try {
      const tempLayer = `https://tile.weatherlayers.com/temperature/{z}/{x}/{y}.png?apiKey=${weatherLayersApiKey}`;
      console.log('Weather Layer URL:', tempLayer);
      setWeatherData({ tempLayer });
    } catch (error) {
      console.error('Помилка отримання URL погодних шарів:', error);
    }
  };

  // Ініціалізація карти
  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([50.4501, 30.5236], 10);
    }

    const map = mapInstance.current;

    // Видаляємо всі шари перед додаванням нового
    map.eachLayer(layer => map.removeLayer(layer));

    // Додаємо шар залежно від вибраного типу картки
    if (mapType === 'standard') {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
      }).addTo(map);
    } else if (mapType === 'satellite') {
      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
        }
      );
      const labels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '',
          pane: 'overlayPane',
        }
      );
      satellite.addTo(map);
      labels.addTo(map);
    } else if (mapType === 'topographic') {
      L.tileLayer(
        'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=97187d076fc74bc8967f2ec4e6c56a28',
        {
          attribution: 'Maps © Thunderforest, Data © OpenStreetMap contributors',
          maxZoom: 22,
        }
      ).addTo(map);
    }

    if (weatherData?.tempLayer) {
      const tempLayer = L.tileLayer(weatherData.tempLayer, { opacity: 0.6 });
      tempLayer.addTo(map);
    }

    // Додаємо маркери на карту
    markers.forEach((marker, index) => {
      const markerIcon = L.divIcon({
        html: `<div style="background-color: #${index === 0 ? '3CB043' : index === markers.length - 1 ? 'E3242B' : '1E90FF'};
                  width: 24px; height: 24px; border-radius: 12px; border: 2px solid white;
                  display: flex; justify-content: center; align-items: center; color: white; font-weight: bold;
                  text-align: center; line-height: 24px;">
                 ${index + 1}
               </div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const markerInstance = L.marker([marker.lat, marker.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(marker.title || `Точка ${index + 1}`)
        .on('click', () => {
          setSelectedMarker(marker);
          setModalOpen(true);
        });
    });

    // Додаємо обробник кліку
    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [weatherData, mapType, markers]);

  // Обробник кліка по карті
  const handleMapClick = e => {
    const { lat, lng } = e.latlng;
    const newMarker = {
      lat,
      lng,
      popup: `Маркер ${markers.length + 1}`,
    };

    setMarkers(prev => [...prev, newMarker]);
  };

  // Очищення всіх маркерів та маршрутів
  const clearAll = () => {
    const map = mapInstance.current;

    // Видаляємо маршрут, якщо він існує
    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
    }

    // Видаляємо інформацію про маршрут, якщо вона існує
    if (routeInfoControl) {
      map.removeControl(routeInfoControl);
      setRouteInfoControl(null);
    }

    setMarkers([]);
    setError(null);
  };

  // Функція для закриття модального вікна
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Функція для обробки змін у формі
  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Функція для відправки форми
  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedMarker) {
      console.error('Маркер не вибрано!');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('lat', selectedMarker.lat);
    data.append('lng', selectedMarker.lng);
    data.append('private', formData.Private || false);

    if (formData.files.length > 0) {
      data.append('file', formData.files[0]);
    }

    console.log('Вибрані дані для відправки:', {
      title: formData.title,
      category: formData.category,
      lat: selectedMarker.lat,
      lng: selectedMarker.lng,
      private: formData.Private || false,
      file: formData.files[0],
    });

    try {
      await axios.post('http://localhost:4000/api/marker', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Дані успішно відправлено');
    } catch (err) {
      console.error('Помилка при відправці:', err);
    }

    setMarkers(prevMarkers =>
      prevMarkers.map(marker =>
        marker === selectedMarker ? { ...marker, title: formData.title } : marker
      )
    );

    setModalOpen(false);
  };

  return (
    <div>
      <div ref={mapRef} className="w-auto h-screen"></div>

      <div
        className="absolute top-4 right-4 flex flex-col space-y-2 z-10"
        style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000 }}
      >
        <button
          onClick={() => setMapType('standard')}
          className="px-4 py-2 bg-blue-500 text-white rounded transition-all duration-300 hover:bg-blue-600"
        >
          Стандартна
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className="px-4 py-2 bg-blue-500 text-white rounded transition-all duration-300 hover:bg-blue-600"
        >
          Супутникова
        </button>
        <button
          onClick={() => setMapType('topographic')}
          className="px-4 py-2 bg-blue-500 text-white rounded transition-all duration-300 hover:bg-blue-600"
        >
          Топографічна
        </button>

        <div className="pt-4"></div>
      </div>

      {/* Модальне вікно для введення даних маркера */}
      {modalOpen && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded shadow-lg z-1000">
          <h3 className="text-xl mb-4">Додати інформацію про маркер:</h3>
          <form onSubmit={handleSubmit}>
            <label className="block mb-2">
              Оберіть назву:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                className="border border-gray-300 p-2 w-full"
                placeholder="Введіть назву маркера"
                required
              />
            </label>
            <label className="block mb-4">
              Оберіть категорію:
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="border border-gray-300 p-2 w-full"
                required
              >
                <option value="">Оберіть категорію</option>
                <option value="well">Криниця</option>
                <option value="spring">Джерело</option>
                <option value="water_machine">Автомат з водою</option>
                <option value="pump_room">Бювет</option>
                <option value="standpipe">Колонка</option>
              </select>
            </label>
            <label className="flex mb-4">
              <input type="checkbox" name="Private" onChange={handleFormChange} />
              <span className="ml-2">Приватний маркер?</span>
            </label>
            <label className="block mb-2">
              <div className="relative">
                <input
                  type="file"
                  name="files"
                  id="fileInput"
                  onChange={e => {
                    setFormData({
                      ...formData,
                      files: e.target.files,
                    });
                  }}
                  className="hidden"
                />
                <div className="flex justify-center">
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer inline-block px-4 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300 transition-all"
                  >
                    {formData.files.length > 0
                      ? `Вибрано: ${formData.files[0].name}`
                      : 'Завантажити файл'}
                  </label>
                </div>
              </div>
            </label>
            <div className="flex justify-between">
              <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                Зберегти
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
              >
                Закрити
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MapView;
