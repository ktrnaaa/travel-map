import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  
  
  
  // API ключі
  const weatherApiKey = '53f660d63998c9aff94a039be901d2ba';
  const graphHopperApiKey = '172690f6-9d12-43a0-868f-a33d3154e508';
  const weatherLayersApiKey = 'tXqVwo5dNRn5uaNDKEJM';

  // Функція для отримання URL погодних шарів
  const getWeatherData = () => {
  try {
    const tempLayer = `https://tile.weatherlayers.com/temperature/{z}/{x}/{y}.png?apiKey=${weatherLayersApiKey}`;
    console.log("Weather Layer URL:", tempLayer);
    setWeatherData({ tempLayer });
  } catch (error) {
    console.error('Помилка отримання URL погодних шарів:', error);
  }
};
  
  /*const getWeatherData = () => {
    try {
      const rainLayer = `https://tile.openweathermap.org/map/rain_new/{z}/{x}/{y}.png?appid=${weatherApiKey}`;
      const cloudsLayer = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${weatherApiKey}`;
      const tempLayer = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${weatherApiKey}`;

      setWeatherData({ rainLayer, cloudsLayer, tempLayer });
    } catch (error) {
      console.error('Помилка отримання URL погодних шарів:', error);
    }
  };*/
  

  // Функція для побудови маршруту через GraphHopper API
  const calculateRoute = async () => {
    if (markers.length < 2) {
      setError("Потрібно встановити як мінімум дві точки для побудови маршруту");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Формуємо рядок запиту з точками вручну
      let url = 'https://graphhopper.com/api/1/route?';
      
      // Додаємо кожну точку як окремий параметр point
      markers.forEach(marker => {
        url += `point=${marker.lat},${marker.lng}&`;
      });
      
      // Додаємо інші параметри
      url += `vehicle=car&locale=uk&key=${graphHopperApiKey}&points_encoded=false&instructions=true`;
      
      console.log("Отправляем запрос:", url);
      
      const response = await axios.get(url);
      
      console.log("Отримана відповідь від GraphHopper:", response.data);
      
      if (response.data && response.data.paths && response.data.paths.length > 0) {
        displayRoute(response.data);
      } else {
        setError("Не вдалося збудувати маршрут між зазначеними точками");
      }
    } catch (error) {
      console.error('Помилка при запиті до GraphHopper API:', error);
      
      // Більш детальна інформація про помилку
      if (error.response) {
        console.error('Відповідь сервера:', error.response.data);
        setError(`Помилка сервера: ${error.response.status} - ${error.response.data.message || 'Невідома помилка'}`);
      } else if (error.request) {
        setError("Відповіді від сервера немає. Перевірте підключення до Інтернету");
      } else {
        setError(`Ошибка: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Функція для відображення маршруту на карті
  const displayRoute = (routeData) => {
    const map = mapInstance.current;
    
    // Видаляємо попередній маршрут, якщо він існує
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }
    
    // Видаляємо попередню інформацію про маршрут, якщо вона існує
    if (routeInfoControl) {
      map.removeControl(routeInfoControl);
    }
    
    // Отримуємо координати з відповіді GraphHopper
    const path = routeData.paths[0];
    const coordinates = path.points.coordinates.map(point => [point[1], point[0]]);
    
    // Створюємо полілінію маршруту
    const newRouteLayer = L.polyline(coordinates, {
      color: '#0066ff',
      weight: 5,
      opacity: 0.7
    }).addTo(map);
    
    setRouteLayer(newRouteLayer);
    
    // Підлаштовуємо зум картки під маршрут
    map.fitBounds(newRouteLayer.getBounds(), { padding: [50, 50] });
    
    // Відображаємо інформацію про маршрут
    const info = L.control({ position: 'bottomleft' });
    info.onAdd = function() {
      const div = L.DomUtil.create('div', 'route-info');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.2); margin-bottom: 10px;">
          <h4 style="margin: 0 0 5px 0; font-weight: bold;">Інформація про маршрут</h4>
          <p style="margin: 5px 0;">Відстань: ${(path.distance / 1000).toFixed(2)} км</p>
          <p style="margin: 5px 0;">Час: ${Math.floor(path.time / 60000)} мін</p>
        </div>
      `;
      return div;
    };
    
    info.addTo(map);
    setRouteInfoControl(info);
  };
  
  useEffect(() => {
  getWeatherData();
}, []);


  // Ініціалізація карти
  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([50.4501, 30.5236], 10);
    }

    const map = mapInstance.current;

    // Видаляємо всі шари перед додаванням нового
    map.eachLayer((layer) => map.removeLayer(layer));

    // Додаємо шар залежно від вибраного типу картки
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
      /*L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '',
      }).addTo(map);*/
      L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=97187d076fc74bc8967f2ec4e6c56a28', {
  attribution: 'Maps © Thunderforest, Data © OpenStreetMap contributors',
  maxZoom: 22
}).addTo(map);
    }
    
      if (weatherData?.tempLayer) {
  const tempLayer = L.tileLayer(weatherData.tempLayer, { opacity: 0.6 });
  tempLayer.addTo(map);
}
    // Додаємо погодні шари, якщо вони є
    /*if (weatherData) {
      L.tileLayer(weatherData.rainLayer, { opacity: 0.8 }).addTo(map);
      L.tileLayer(weatherData.cloudsLayer, { opacity: 0.6 }).addTo(map);
      L.tileLayer(weatherData.tempLayer, { opacity: 0 }).addTo(map);
    }*/

    // Додаємо маркери на карту
    markers.forEach((marker, index) => {
      const markerIcon = L.divIcon({
        html: `<div style="background-color: #${index === 0 ? '3CB043' : index === markers.length - 1 ? 'E3242B' : '1E90FF'};
                          width: 24px; height: 24px; border-radius: 12px; border: 2px solid white;
                          display: flex; justify-content: center; align-items: center; color: white; font-weight: bold;">
                 ${index + 1}
               </div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      L.marker([marker.lat, marker.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(marker.popup || `Точка ${index + 1}`);
    });

    // Додаємо обробник кліку
    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [weatherData, mapType, markers]);

  // Обробник кліка по карті
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    const newMarker = {
      lat,
      lng,
      popup: `Точка ${markers.length + 1}`
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
        <button onClick={() => setMapType('standard')} className="px-4 py-2 bg-blue-500 text-white rounded transition-all duration-300 hover:bg-blue-600">
          Стандартна
        </button>
        <button onClick={() => setMapType('satellite')} className="px-4 py-2 bg-blue-500 text-white rounded transition-all duration-300 hover:bg-blue-600">
          Супутникова
        </button>
        <button onClick={() => setMapType('topographic')} className="px-4 py-2 bg-blue-500 text-white rounded transition-all duration-300 hover:bg-blue-600">
          Топографічна
        </button>
        
        <div className="pt-4"></div>
        
        <button
          onClick={calculateRoute}
          disabled={markers.length < 2 || isLoading}
          className={`px-4 py-2 ${markers.length < 2 ? 'bg-gray-400' : 'bg-green-500'} text-white rounded`}
        >
          {isLoading ? 'Розрахунок...' : 'Прокласти маршрут'}
        </button>
        
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Очистити маршрут
        </button>
      </div>
      
      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          <strong>Помилка:</strong> {error}
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-lg z-1000">
        <p className="font-semibold">Побудова маршруту:</p>
        <p>1. Натисніть на карту, щоб додати точки (мінімум 2)</p>
        <p>2. Натисніть "Прокласти маршрут" для розрахунку</p>
        <p>3. Натисніть "Очистити все" для того, щоб очистити маршрут</p>
      </div>
    </div>
  );
};

export default MapView;