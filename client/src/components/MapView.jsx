import axios from 'axios';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { FaMap, FaSatellite } from 'react-icons/fa';
import { GiCompass } from 'react-icons/gi';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  const [uploadProgress, setUploadProgress] = useState({}); // Объект для хранения прогресса загрузки каждого файла
  const [imagePreviews, setImagePreviews] = useState([]); // Массив превью
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const mapRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const mapInstance = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Стейт для модального вікна і даних маркерів
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    tags: [],
    files: [],
    fileUrls: [],
  });
  const [selectedMarker, setSelectedMarker] = useState(null);

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
  }, [mapType, markers]);

  // Обробник кліка по карті
  const handleMapClick = e => {
    const { lat, lng } = e.latlng;
    const newMarker = {
      lat,
      lng,
      popup: `Маркер ${markers.length + 1}`,
    };

    setMarkers(prev => [...prev, newMarker]);
    setSelectedMarker(newMarker); // Устанавливаем текущий маркер
    setModalOpen(true); // Открываем модальное окно
  };

  // Функція для закриття модального вікна
  const handleModalClose = () => {
    setModalOpen(false);
  };

  // Функція для обробки змін у формі
  const handleFormChange = e => {
    const { name, value } = e.target;
    // Игнорируем поле tags, так как у нас особый обработчик для него
    if (name !== 'tags') {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Функція для обробки зміни файлу
  // Функція для обробки зміни файлу
  const handleFileChange = async e => {
    const selectedFiles = Array.from(e.target.files);

    if (!selectedFiles || selectedFiles.length === 0) {
      // Если файлы не выбраны, очищаем состояние
      setFormData(prev => ({
        ...prev,
        files: [],
        fileUrls: [],
      }));
      setImagePreviews([]);
      return;
    }

    // Обновляем список файлов в состоянии
    setFormData(prev => ({
      ...prev,
      files: selectedFiles,
    }));

    // Очищаем предыдущие превью
    setImagePreviews([]);

    // Создаем превью для каждого выбранного файла
    selectedFiles.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = event => {
          setImagePreviews(prev => [...prev, { id: index, preview: event.target.result }]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Начинаем загрузку каждого файла
    const uploadFiles = async () => {
      setLoading(true);
      const fileUrls = [];

      // Инициализируем прогресс загрузки для каждого файла
      const initialProgress = {};
      selectedFiles.forEach((file, index) => {
        initialProgress[index] = 0;
      });
      setUploadProgress(initialProgress);

      // Загружаем каждый файл отдельно
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileData = new FormData();
        fileData.append('file', file);

        try {
          // Загружаем файл на сервер
          const response = await axios.post('http://localhost:4000/api/upload', fileData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: progressEvent => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(prev => ({
                ...prev,
                [i]: percentCompleted,
              }));
            },
          });

          // Сохраняем URL файла
          if (response.data && response.data.url) {
            fileUrls.push(response.data.url);
          }
        } catch (err) {
          console.error(`Помилка при завантаженні файлу ${file.name}:`, err);
        }
      }

      // Обновляем массив URL-адресов в состоянии
      setFormData(prev => ({
        ...prev,
        fileUrls: fileUrls,
      }));

      setLoading(false);
    };

    // Запускаем загрузку файлов
    if (selectedFiles.length > 0) {
      uploadFiles();
    }
  };

  // Функция для удаления файла из списка
  const handleRemoveFile = fileId => {
    // Если в процессе загрузки, не позволяем удалять файлы
    if (loading) return;

    // Удаляем файл из всех массивов
    setFormData(prev => {
      const updatedFiles = prev.files.filter((_, index) => index !== fileId);
      const updatedUrls = prev.fileUrls.filter((_, index) => index !== fileId);

      return {
        ...prev,
        files: updatedFiles,
        fileUrls: updatedUrls,
      };
    });

    // Удаляем превью
    setImagePreviews(prev => prev.filter(item => item.id !== fileId));

    // Очищаем прогресс загрузки
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  // Функции для обработки событий drag and drop
  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Создаем событие, похожее на onChange для input[type="file"]
      const mockEvent = {
        target: {
          files: e.dataTransfer.files,
        },
      };

      handleFileChange(mockEvent);
    }
  };

  // Функція для відправки форми
  const handleSubmit = async e => {
    e.preventDefault();

    setLoading(true);

    if (!selectedMarker) {
      console.error('Маркер не вибрано!');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('tags', JSON.stringify(formData.tags));
    data.append('lat', selectedMarker.lat);
    data.append('lng', selectedMarker.lng);
    data.append('private', formData.Private || false);
    // Добавляем URL файлов, если они уже загружены
    if (formData.fileUrls && formData.fileUrls.length > 0) {
      data.append('fileUrls', JSON.stringify(formData.fileUrls));
    }
    // Или добавляем файлы, если они еще не были загружены
    else if (formData.files && formData.files.length > 0) {
      formData.files.forEach(file => {
        data.append('files', file);
      });
    }

    try {
      await axios.post('http://localhost:4000/api/marker', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Дані успішно відправлено');

      setMarkers(prevMarkers =>
        prevMarkers.map(marker =>
          marker === selectedMarker ? { ...marker, title: formData.title } : marker
        )
      );

      setModalOpen(false);
    } catch (err) {
      console.error('Помилка при відправці:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTagColor = tag => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-300',
      'bg-green-100 text-green-800 border-green-300',
      'bg-purple-100 text-purple-800 border-purple-300',
      'bg-yellow-100 text-yellow-800 border-yellow-300',
      'bg-red-100 text-red-800 border-red-300',
      'bg-indigo-100 text-indigo-800 border-indigo-300',
      'bg-pink-100 text-pink-800 border-pink-300',
      'bg-teal-100 text-teal-800 border-teal-300',
    ];

    // Выбираем цвет на основе первого символа тега
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div>
      <div ref={mapRef} className="w-auto h-screen"></div>

      {modalOpen && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl z-10
              w-11/12 sm:w-[450px] max-w-[95vw] overflow-hidden border border-gray-100"
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-5 sm:p-6 pb-7">
            <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
              Створення маркера
            </h3>
            <p className="text-blue-100 mt-1 text-xs sm:text-sm">
              Додайте інформацію про нову локацію
            </p>

            <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7 pt-0">
            <div className="space-y-5">
              <div className="group -mt-1">
                <div className="group mb-5">
                  <label
                    htmlFor="title"
                    className="inline-block text-xs font-semibold uppercase text-gray-500 mb-1.5 group-focus-within:text-blue-600 transition duration-200"
                  >
                    НАЗВА
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl
                      text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200
                      transition duration-200 text-sm sm:text-base"
                    placeholder="Введіть назву маркера"
                    required
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="tags"
                    className="inline-block text-xs font-semibold uppercase text-gray-500 mb-1.5 group-focus-within:text-blue-600 transition duration-200"
                  >
                    МІТКИ
                  </label>

                  <div className="flex">
                    <input
                      type="text"
                      id="tagInput"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tagInput.trim()],
                          }));
                          setTagInput('');
                        }
                      }}
                      className="flex-grow px-4 py-2.5 bg-white border-2 border-gray-200 rounded-l-xl
      text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200
      transition duration-200 text-sm sm:text-base"
                      placeholder="Уведіть мітку"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tagInput.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tagInput.trim()],
                          }));
                          setTagInput('');
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-r-xl transition duration-200 flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Натисніть Enter або кнопку, щоб додати мітку
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.length > 0
                      ? formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`${getTagColor(tag)} text-l font-medium px-3 py-1.5 rounded-full flex items-center shadow-sm border border-opacity-20 transition-all hover:shadow-md`}
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: prev.tags.filter((_, i) => i !== index),
                                }));
                              }}
                              className="ml-1.5 text-gray-500 hover:text-red-600 transition-colors w-5 h-5 rounded-full
  flex items-center justify-center bg-white bg-opacity-80 hover:bg-opacity-100
  shadow-sm border border-gray-200 hover:border-red-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </span>
                        ))
                      : null}
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="Private"
                    onChange={handleFormChange}
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4
                        peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-5
                        peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5
                        after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full
                        after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
                  <span className="ml-3 text-sm text-gray-700">Приватний маркер</span>
                </label>
              </div>

              {/* Загрузка файла с улучшенным превью */}
              {/* Input для загрузки файлов */}
              <div className="pt-1">
                <label className="inline-block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                  ЗОБРАЖЕННЯ/ВІДЕО
                </label>
                <input
                  type="file"
                  name="files"
                  id="fileInput"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                  accept="image/*,video/*"
                  multiple
                />

                {/* Заменяем label на div с drag-and-drop функциональностью */}
                <div
                  className={`border-2 border-dashed rounded-xl transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : formData.files.length > 0
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <label
                    htmlFor="fileInput"
                    className="flex items-center justify-center px-4 py-4 cursor-pointer w-full"
                  >
                    <div className="flex items-center">
                      {loading ? (
                        <svg
                          className="animate-spin h-5 w-5 mr-3 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 mr-3 ${formData.files.length > 0 ? 'text-blue-500' : 'text-gray-400'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      )}

                      <div className="flex flex-col items-start">
                        <span
                          className={`text-sm font-medium ${formData.files.length > 0 ? 'text-blue-700' : 'text-gray-600'}`}
                        >
                          {isDragging
                            ? 'Відпустіть, щоб завантажити'
                            : formData.files.length > 0
                              ? `Вибрано файлів: ${formData.files.length}`
                              : 'Натисніть або перетягніть файли'}
                        </span>
                        {formData.files.length > 0 && loading && (
                          <span className="text-xs text-blue-500 mt-1">Завантаження...</span>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Индикаторы загрузки для каждого файла */}
                {formData.files.length > 0 && loading && (
                  <div className="mt-2 space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <span className="truncate max-w-[200px] mr-2">{file.name}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                            style={{ width: `${uploadProgress[index] || 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 min-w-[40px] text-right">
                          {uploadProgress[index] || 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Превью изображений в виде сетки */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase text-gray-500 mb-1.5">
                      Попередній перегляд
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {imagePreviews.map(item => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg overflow-hidden relative group"
                        >
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <img
                              src={item.preview}
                              className="max-w-full max-h-full object-cover"
                              alt={`Превью ${item.id + 1}`}
                            />
                          </div>

                          {/* Кнопка для удаления файла */}
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center
  shadow-md transform transition-all duration-200 hover:scale-110
  opacity-0 group-hover:opacity-100"
                            disabled={loading}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={handleModalClose}
                className="order-2 sm:order-1 px-5 py-2.5 sm:flex-1 border-2 border-red-500 rounded-xl font-medium
                    text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600
                    transition-all duration-200 text-sm"
                disabled={loading}
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`order-1 sm:order-2 px-5 py-2.5 sm:flex-1 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                } rounded-xl font-medium
                    text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30
                    transition-all duration-200 text-sm flex justify-center items-center`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Зберігання...
                  </>
                ) : (
                  'Зберегти'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10" style={{ zIndex: 1000 }}>
        <button
          onClick={() => setMapType('standard')}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-300
  ${mapType === 'standard' ? 'bg-blue-600 text-white transform scale-105' : 'bg-gray-400 text-gray-900 hover:bg-gray-500'}`}
        >
          <FaMap className="text-xl" />
          Стандартна
        </button>

        <button
          onClick={() => setMapType('satellite')}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-300
  ${mapType === 'satellite' ? 'bg-orange-500 text-white transform scale-105' : 'bg-gray-400 text-gray-900 hover:bg-gray-500'}`}
        >
          <FaSatellite className="text-xl" />
          Супутникова
        </button>

        <button
          onClick={() => setMapType('topographic')}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-300
  ${mapType === 'topographic' ? 'bg-green-500 text-white transform scale-105' : 'bg-gray-400 text-gray-900 hover:bg-gray-500'}`}
        >
          <GiCompass className="text-xl" />
          Топографічна
        </button>
      </div>
    </div>
  );
};

export default MapView;
