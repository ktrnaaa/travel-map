import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Важно импортировать CSS!
import './style.css';

// Представим, что это список источников воды:
const waterSources = [
  {
    id: 1,
    lat: 49.965052400995425,
    lng: 31.10522143975114,
    name: 'Колодец у школы',
    image: 'https://example.com/well1.jpg',
  },
  { id: 2, lat: 50.46, lng: 30.53, name: 'Ручей за лесом', image: 'https://example.com/well2.jpg' },
];

export const useWaterMarkers = mapInstance => {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Проверяем, что mapInstance существует и имеет свойство .current
    if (!mapInstance || !mapInstance.current) return;

    const map = mapInstance.current;

    // Удаляем старые маркеры
    markers.forEach(marker => {
      if (map && marker) {
        marker.remove(); // или map.removeLayer(marker)
      }
    });

    // Создаём новые маркеры
    const newMarkers = waterSources.map(source => {
      const marker = L.marker([source.lat, source.lng], {
        icon: L.divIcon({
          html: `<div class="water-marker-inner">💧</div>`,
          className: 'custom-water-marker',
          iconSize: [30, 30],
        }),
      }).bindPopup(
        `<b>${source.name}</b><br><img src="${source.image}" style="width: 100px;" alt=""/>`
      );

      if (map) marker.addTo(map);
      return marker;
    });

    setMarkers(newMarkers);

    // Очистка при размонтировании
    return () => {
      newMarkers.forEach(marker => {
        if (map && marker) {
          marker.remove(); // или map.removeLayer(marker)
        }
      });
    };
  }, [mapInstance]); // Убираем markers.length из зависимостей

  return markers;
};
