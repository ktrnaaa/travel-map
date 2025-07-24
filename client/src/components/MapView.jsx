import axios from 'axios';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';

import 'leaflet/dist/leaflet.css';
import AuthMenu from './map/AuthMenu.jsx';
import LayersSwitcher from './map/LayersSwitcher';
import RouteFunctionality from './map/RouteFunctionality.jsx';
import SidePanel from './map/SidePanel.jsx';
import WeatherWidget from './map/WeatherWidget';

const MapView = () => {
  const [uploadProgress, setUploadProgress] = useState({}); // Об'єкт для збереження прогресу завантаження кожного файлу
  const [imagePreviews, setImagePreviews] = useState([]); // Массив превью
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  // Стейт для модального вікна і даних маркерів
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: [],
    files: [],
    fileUrls: [],
  });
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [searchParams] = useSearchParams();
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('standard');
  const mapInstance = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // состояния для боковой панели
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedMarkerForPanel, setSelectedMarkerForPanel] = useState(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/markers');

        // Обрабатываем данные с сервера, чтобы они соответствовали нужному формату
        const processedMarkers = response.data.map(marker => ({
          ...marker,
          // Убеждаемся, что есть popup для совместимости с существующим кодом
          popup: marker.popup || `Маркер: ${marker.title || 'Без названия'}`,
        }));

        setMarkers(processedMarkers);
      } catch (error) {
        console.error('Ошибка при загрузке маркеров:', error);
      }
    };

    fetchMarkers();
  }, []);

  // Функция для обработки изменений категории
  const handleChange = newValue => {
    setSelectedOption(newValue);
    // Также обновляем данные формы
    setFormData(prev => ({
      ...prev,
      category: newValue ? newValue.value : '',
    }));
  };

  const handleCreate = inputValue => {
    console.log('Creating new option:', inputValue);
    const newOption = { label: inputValue, value: inputValue.toLowerCase() };
    setOptions(prev => {
      console.log('Previous options:', prev);
      const newOptions = [...prev, newOption];
      console.log('New options:', newOptions);
      return newOptions;
    });
    setSelectedOption(newOption);
    console.log('New option created:', newOption);
  };

  const OptionWithDelete = props => {
    if (props.data.__isNew__) {
      return <components.Option {...props}>{props.children}</components.Option>;
    }
    return (
      <components.Option {...props}>
        <div className="flex justify-between items-center w-full">
          <span>{props.data.label}</span>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setOptions(prev => prev.filter(opt => opt.value !== props.data.value));
              if (selectedOption && selectedOption.value === props.data.value) {
                setSelectedOption(null);
                setFormData(prev => ({ ...prev, category: '' }));
              }
            }}
            className="ml-2 w-4 h-4 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-700 transition-colors duration-150 shadow-sm cursor-pointer"
            title="Удалить категорию"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </components.Option>
    );
  };

  // Функция для удаления маркера
  const handleDeleteMarker = async markerId => {
    try {
      const response = await axios.delete(`http://localhost:4000/marker/${markerId}`);
      console.log('Маркер успешно удален:', response.data);

      // Удаляем маркер из локального состояния
      setMarkers(prevMarkers => prevMarkers.filter(marker => marker._id !== markerId));
    } catch (error) {
      console.error('Ошибка при удалении маркера:', error);
      throw error;
    }
  };

  // Функция для редактирования маркера
  const handleEditMarker = markerData => {
    // Устанавливаем данные маркера для редактирования
    setSelectedMarker(markerData);

    // Заполняем форму данными маркера
    setFormData({
      title: markerData.title || '',
      category: markerData.category || '',
      tags: markerData.tags || [],
      files: [],
      fileUrls: markerData.fileUrls || [],
      description: markerData.description || '',
      Private: markerData.private || false,
    });

    // Устанавливаем выбранную категорию
    if (markerData.category) {
      const categoryOption = options.find(option => option.value === markerData.category);
      setSelectedOption(categoryOption || null);
    }

    // Открываем модальное окно
    setModalOpen(true);
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

    // Додаємо маркери на карту
    markers.forEach(marker => {
      L.marker([marker.lat, marker.lng])
        .addTo(map)
        .on('click', () => {
          setSelectedMarkerForPanel(marker);
          setSidePanelOpen(true);
        });
    });

    // Додаємо обробник кліку
    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapType, markers]);

  useEffect(() => {
    // Проверяем URL параметры при загрузке маркеров
    if (markers.length > 0 && mapInstance.current) {
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const zoom = searchParams.get('zoom');
      const markerId = searchParams.get('marker');

      if (lat && lng) {
        const targetLat = parseFloat(lat);
        const targetLng = parseFloat(lng);
        const targetZoom = zoom ? parseInt(zoom) : 15;

        // Центрируем карту на указанных координатах
        mapInstance.current.setView([targetLat, targetLng], targetZoom);

        // Если указан ID маркера, ищем и открываем его
        if (markerId) {
          const targetMarker = markers.find(marker => marker._id === markerId);
          if (targetMarker) {
            setSelectedMarkerForPanel(targetMarker);
            setSidePanelOpen(true);

            // Очищаем URL параметры после открытия
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    }
  }, [markers, searchParams]);

  // Обробник кліка по карті
  const handleMapClick = e => {
    if (modalOpen) return;
    const { lat, lng } = e.latlng;
    const newMarker = {
      lat,
      lng,
      popup: `Маркер ${markers.length + 1}`,
    };

    setMarkers(prev => [...prev, newMarker]);
    setSelectedMarker(newMarker); // Встановлюємо поточний маркер
    setModalOpen(true); // Відкриваємо модальне вікно
  };

  // Функція для закриття бокової панелі
  const handleSidePanelClose = () => {
    setSidePanelOpen(false);
    setSelectedMarkerForPanel(null);
  };

  // Функція для закриття модального вікна
  const handleModalClose = () => {
    if (selectedMarker && !selectedMarker.title) {
      // Удаляем последний маркер, если он пустой
      setMarkers(prev => prev.filter(marker => marker !== selectedMarker));
    }
    setModalOpen(false);
    setSelectedMarker(null);
  };

  // Функція для обробки змін у формі
  const handleFormChange = e => {
    const { name, value } = e.target;
    // Ігноруємо поле tags, тому що у нас особливий обробник для нього
    if (name !== 'tags') {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Функція для обробки зміни файлу
  const handleFileChange = async e => {
    const selectedFiles = Array.from(e.target.files);

    if (!selectedFiles || selectedFiles.length === 0) {
      // Якщо файли не вибрані, очищаємо стан
      setFormData(prev => ({
        ...prev,
        files: [],
        fileUrls: [],
      }));
      setImagePreviews([]);
      return;
    }

    // Оновлюємо список файлів у стані
    setFormData(prev => ({
      ...prev,
      files: selectedFiles,
    }));

    // Очищаємо попередні прев'ю
    setImagePreviews([]);

    // Створюємо прев'ю для кожного вибраного файлу
    selectedFiles.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = event => {
          setImagePreviews(prev => [...prev, { id: index, preview: event.target.result }]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Починаємо завантаження кожного файлу
    const uploadFiles = async () => {
      setLoading(true);
      const fileUrls = [];

      // Ініціалізуємо прогрес завантаження для кожного файлу
      const initialProgress = {};
      selectedFiles.forEach((file, index) => {
        initialProgress[index] = 0;
      });
      setUploadProgress(initialProgress);

      // Завантажуємо кожен файл окремо
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileData = new FormData();
        fileData.append('file', file);

        try {
          // Завантажуємо файл на сервер
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

          // Зберігаємо URL файлу
          if (response.data && response.data.url) {
            fileUrls.push(response.data.url);
          }
        } catch (err) {
          console.error(`Помилка при завантаженні файлу ${file.name}:`, err);
        }
      }

      // Оновлюємо масив URL-адрес у стані
      setFormData(prev => ({
        ...prev,
        fileUrls: fileUrls,
      }));

      setLoading(false);
    };

    // Запускаємо завантаження файлів
    if (selectedFiles.length > 0) {
      uploadFiles();
    }
  };

  // Функція видалення файлу зі списку
  const handleRemoveFile = fileId => {
    // Если в процессе загрузки, не позволяем удалять файлы
    if (loading) return;

    // Видаляємо файл із усіх масивів
    setFormData(prev => {
      const updatedFiles = prev.files.filter((_, index) => index !== fileId);
      const updatedUrls = prev.fileUrls.filter((_, index) => index !== fileId);

      return {
        ...prev,
        files: updatedFiles,
        fileUrls: updatedUrls,
      };
    });

    // Видаляємо прев'ю
    setImagePreviews(prev => prev.filter(item => item.id !== fileId));

    // Очищаємо прогрес завантаження
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  // Функції обробки подій drag and drop
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
      // Створюємо подію, подібну до onChange для input[type="file"]
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
      console.error('Маркер не выбран!');
      setLoading(false);
      return;
    }

    const data = {
      title: formData.title,
      category: selectedOption ? selectedOption.value : '',
      tags: formData.tags,
      lat: selectedMarker.lat,
      lng: selectedMarker.lng,
      private: !!formData.Private, // Преобразование в Boolean
      fileUrls: formData.fileUrls || [],
      description: formData.description || '',
    };

    try {
      const response = await axios.post('http://localhost:4000/marker', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Данные успешно отправлены:', response.data);

      setMarkers(prevMarkers =>
        prevMarkers.map(marker =>
          marker === selectedMarker
            ? {
                ...marker,
                ...response.data, // Добавляем все данные с сервера
                title: formData.title,
                category: selectedOption ? selectedOption.value : '',
                tags: formData.tags,
                description: formData.description || '',
                fileUrls: formData.fileUrls || [],
                private: !!formData.Private,
              }
            : marker
        )
      );

      // Очищаем все поля формы после успешной отправки
      setFormData({
        title: '',
        category: '',
        tags: [],
        files: [],
        fileUrls: [],
        description: '',
        Private: false,
      });

      // Очищаем дополнительные состояния
      setSelectedOption(null);
      setTagInput('');
      setImagePreviews([]);
      setUploadProgress({});

      setModalOpen(false);
    } catch (err) {
      console.error('Ошибка при отправке:', err);
    } finally {
      setLoading(false);
    }
  };

  /*const getTagColor = tag => {
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

    // Вибираємо колір на основі першого символу тега
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };*/

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      outline: 'none',
      borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb', // focus:border-blue-500
      boxShadow: state.isFocused ? '0 0 0 1px #bfdbfe' : 'none', // focus:ring-blue-200
      backgroundColor: 'white',
      borderWidth: 2,
      borderRadius: 12,
      minHeight: 44,
      paddingLeft: 16,
      paddingRight: 16,
      fontSize: 16,
      color: '#1f2937', // text-gray-800
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }),
    placeholder: provided => ({
      ...provided,
      color: '#9ca3af', // placeholder-gray-400
      fontSize: 16,
    }),
    singleValue: provided => ({
      ...provided,
      color: '#1f2937', // text-gray-800
      fontSize: 16,
    }),
  };

  return (
    <div>
      <div ref={mapRef} className="w-auto h-screen"></div>

      {modalOpen && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          bg-gradient-to-br from-white to-gray-50 border rounded-2xl shadow-xl z-[1000]
          w-11/12 sm:w-[450px] border-gray-100"
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-5 sm:p-6 pb-7 rounded-t-2xl">
            <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
              Створення маркера
            </h3>
            <p className="text-blue-100 mt-1 text-xs sm:text-sm">
              Додайте інформацію про нову локацію
            </p>

            <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-full"></div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 pt-3 max-h-[75vh] overflow-y-auto custom-scrollbar"
          >
            <div className="space-y-5">
              <div className="group">
                <div className="group mb-3">
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
    focus:outline-none hover:border-[#9ca3af] transition duration-200 text-sm sm:text-base"
                    placeholder="Введіть назву маркера"
                    required
                  />
                </div>
                <span className="inline-block text-xs font-semibold uppercase text-gray-500 mb-1.5">
                  Категорія
                </span>
                <CreatableSelect
                  styles={customStyles}
                  className="mb-3"
                  isClearable
                  onChange={handleChange}
                  onCreateOption={handleCreate}
                  options={options}
                  value={selectedOption}
                  placeholder="Виберіть або створіть категорію"
                  formatCreateLabel={inputValue => (
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Створити категорію `{inputValue}`
                    </div>
                  )}
                  components={{ Option: OptionWithDelete }}
                  noOptionsMessage={() => 'Поки не створено жодної категорії'}
                />

                {
                  // TODO:Тимчасово вимкнув функціонал створення міток
                  /*<div className="group">
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
                          // Проверяем, выбрана ли категория
                          if (selectedOption) {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tagInput.trim()],
                            }));
                            setTagInput('');
                          }
                        }
                      }}
                      className={`flex-grow px-4 py-2.5 bg-white border-2 ${
                        !selectedOption ? 'border-gray-300 opacity-60' : 'border-gray-200'
                      } rounded-l-xl
      text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200
      transition duration-200 text-sm sm:text-base`}
                      placeholder={selectedOption ? 'Уведіть мітку' : 'Спочатку виберіть категорію'}
                      disabled={!selectedOption}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tagInput.trim() && selectedOption) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tagInput.trim()],
                          }));
                          setTagInput('');
                        }
                      }}
                      className={`${
                        selectedOption
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      } text-white font-medium py-2.5 px-4 rounded-r-xl transition duration-200 flex items-center justify-center`}
                      disabled={!selectedOption}
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
                    {selectedOption
                      ? 'Натисніть Enter або кнопку, щоб додати мітку'
                      : 'Спочатку виберіть або створіть категорію щоб додати мітки'}
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
                </div>*/
                }
              </div>
              <div className="pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="Private"
                    checked={!!formData.Private}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        Private: e.target.checked,
                      }))
                    }
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
              {/*Input для завантаження файлів*/}
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
                  accept="image/*,video/*,.webp,image/webp"
                  multiple
                />

                {/* Замінюємо label на div з drag-and-drop функціональністю */}
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

                {/* Індикатори завантаження для кожного файлу */}
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

                {/* попередній перегляд зображень у вигляді сітки */}
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

                          {/* Кнопка видалення файлу */}
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
              <div>
                <label
                  className="inline-block text-xs font-semibold uppercase text-gray-500 mb-1.5"
                  htmlFor="description"
                >
                  Опис
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  cols="50"
                  rows="2"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 placeholder-gray-400 focus:border-blue-500"
                  placeholder="Уведіть опис (необов'язково)"
                />
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

      <SidePanel
        isOpen={sidePanelOpen}
        onClose={handleSidePanelClose}
        markerData={selectedMarkerForPanel}
        onEdit={handleEditMarker}
        onDelete={handleDeleteMarker}
      />

      <div className="absolute top-4 right-4 flex gap-3 z-10" style={{ zIndex: 1000 }}>
        <AuthMenu />
        <LayersSwitcher mapType={mapType} setMapType={setMapType} />
        <WeatherWidget />
        <RouteFunctionality />
      </div>
    </div>
  );
};

export default MapView;
