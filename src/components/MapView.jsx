import React, {useEffect, useRef} from 'react';
import L from 'leaflet'; // Імпортуємо основну бібліотеку leaflet, яка використовується для роботи з картами
import 'leaflet/dist/leaflet.css'; // Імпортуємо стилі для Leaflet, щоб карта відображалась коректно
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // Імпорт стилів для перетаскування маршруту
import 'leaflet-routing-machine'; // Імпорт бібліотеки для перетаскування маршруту

const MapView = () => {
	const mapRef = useRef(null); // посилання на контейнер карти
	
	useEffect(() => {
		// Перевірка, чи карта вже ініціалізована
		if (mapRef.current && !mapRef.current._leaflet_id) {
			// Створення карти
			const map = L.map(mapRef.current).setView([50.4501, 30.5236], 13); // Координати Києва
			
			// Додавання тайл-шарів
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);
			
			// Додавання маркера на карту з координатами Києва
			L.marker([50.4501, 30.5236]).addTo(map).bindPopup('Центр Києва');
      
      // Встановлення маркера
      map.on('click', (e) => {
        const { lat, lng } = e.latlng; // Отримуємо координати кліку

        // Добавляємо координати кліку на карту у вигляді маркеру
        const newMarker = L.marker([lat, lng]).addTo(map).bindPopup('Новий маркер').openPopup();
        
      });
			
			// Створення маршруту за допомогою Leaflet Routing Machine
      const routeControl = L.Routing.control({
        waypoints: [
          L.latLng(50.4501, 30.5236), // Початкова точка
          L.latLng(50.4500, 30.5200), // Кінцева точка
        ],
        routeWhileDragging: true, // Дозвіл на перетаскування маршруту
      }).addTo(map);
		}
	}, []);
	
	return (
		<>
			<div ref={mapRef} style={{width: '100%', height: '800px'}}></div>
		</>
	)
};

export default MapView;
