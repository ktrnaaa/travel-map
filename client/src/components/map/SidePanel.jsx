import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MdDelete, MdClose, MdShare, MdContentCopy, MdCheck } from 'react-icons/md';

const SidePanel = ({ isOpen, onClose, markerData, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!markerData) return null;

  // Мапинг категорий для отображения читаемых названий
  const categoryNames = {
    Home: 'Житло',
    Water: 'Вода',
    Food: 'Їжа',
    Places: 'Місця',
  };

  // Функция для получения читаемого названия категории
  const getCategoryDisplayName = category => {
    return categoryNames[category] || category || 'Без категорії';
  };

  // Показать подтверждение удаления
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  // Подтвердить удаление
  const confirmDelete = async () => {
    try {
      await onDelete(markerData._id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Ошибка при удалении маркера:', error);
    }
  };

  // Отменить удаление
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Обработчик редактирования
  const handleEdit = () => {
    onEdit(markerData);
    onClose();
  };

  // Функции для поделиться
  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setCopied(false);
  };

  // Генерация ссылки для шеринга
  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      lat: markerData.lat.toString(),
      lng: markerData.lng.toString(),
      zoom: '15', // Уровень зума при открытии
      marker: markerData._id,
    });
    return `${baseUrl}/?${params.toString()}`;
  };

  // Генерация текста для шеринга
  const generateShareText = () => {
    const title = markerData.title || 'Маркер на карті';
    const description = markerData.description ? ` - ${markerData.description}` : '';
    const category = markerData.category ? ` (${getCategoryDisplayName(markerData.category)})` : '';
    return `${title}${category}${description}`;
  };

  // Копирование ссылки
  const copyToClipboard = async () => {
    try {
      const shareUrl = generateShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = generateShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Поделиться через Web Share API (если поддерживается)
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: generateShareText(),
          text: generateShareText(),
          url: generateShareUrl(),
        });
      } catch (err) {
        console.error('Ошибка при шеринге:', err);
      }
    }
  };

  // Поделиться в соцсетях
  const shareToSocial = platform => {
    const shareUrl = generateShareUrl();
    const shareText = encodeURIComponent(generateShareText());
    const encodedUrl = encodeURIComponent(shareUrl);

    let socialUrl = '';

    switch (platform) {
      case 'telegram':
        socialUrl = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`;
        break;
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${shareText}%20${encodedUrl}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`;
        break;
      case 'viber':
        socialUrl = `viber://forward?text=${shareText}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(socialUrl, '_blank', 'width=600,height=400');
  };

  return (
    <>
      {/* Основная панель */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-[1001] overflow-y-auto"
            style={{
              filter: showDeleteConfirm || showShareModal ? 'blur(3px)' : 'none',
              transition: 'filter 0.3s ease-in-out',
            }}
          >
            {/* Заголовок панели */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold">{markerData.title || 'Маркер без назви'}</h2>
                    {/* Иконка удаления */}
                    <button
                      onClick={handleDeleteClick}
                      className="text-white hover:text-red-300 transition-colors p-1 ml-2 cursor-pointer"
                      title="Видалити маркер"
                      disabled={showDeleteConfirm || showShareModal}
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </div>
                  {markerData.category && (
                    <span className="inline-block bg-blue-800 bg-opacity-80 px-3 py-1 rounded-full text-sm font-medium text-white border border-blue-500">
                      {getCategoryDisplayName(markerData.category)}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors p-1 flex-shrink-0 cursor-pointer"
                  disabled={showDeleteConfirm || showShareModal}
                >
                  <MdClose className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Содержимое панели */}
            <div className="p-6 space-y-6">
              {/* Координати */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Координати</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">Широта: {markerData.lat?.toFixed(6)}</p>
                  <p className="text-sm text-gray-700">Довгота: {markerData.lng?.toFixed(6)}</p>
                </div>
              </div>

              {/* Описание */}
              {markerData.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Опис</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{markerData.description}</p>
                  </div>
                </div>
              )}

              {/* Теги */}
              {markerData.tags && markerData.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Мітки</h3>
                  <div className="flex flex-wrap gap-2">
                    {markerData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Изображения */}
              {markerData.fileUrls && markerData.fileUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Зображення</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {markerData.fileUrls.map((url, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Зображення ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => {
                            if (!showDeleteConfirm && !showShareModal) {
                              window.open(url, '_blank');
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Статус приватности */}
              {markerData.private && (
                <div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-yellow-800">Приватний маркер</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Дата создания */}
              {markerData.createdAt && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    Дата створення
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {new Date(markerData.createdAt).toLocaleString('uk-UA')}
                    </p>
                  </div>
                </div>
              )}

              {/* Действия */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={handleEdit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                    disabled={showDeleteConfirm || showShareModal}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Редагувати
                  </button>
                  <button
                    onClick={handleShareClick}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                    disabled={showDeleteConfirm || showShareModal}
                  >
                    <MdShare className="w-4 h-4 mr-2" />
                    Поділитися
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно подтверждения удаления */}
      <AnimatePresence>
        {showDeleteConfirm && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 right-0 h-full w-80 sm:w-96 flex items-center justify-center p-4 z-[1002]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Видалити маркер?</h3>
              <p className="text-gray-600 mb-6">
                Ця дія незворотна. Маркер буде видалено назавжди.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Скасувати
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Видалити
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно поделиться */}
      <AnimatePresence>
        {showShareModal && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 right-0 h-full w-80 sm:w-96 flex items-center justify-center p-4 z-[1002]"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Поділитися маркером</h3>
                <button
                  onClick={closeShareModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {/* Копирование ссылки */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Посилання на маркер
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generateShareUrl()}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    {copied ? (
                      <MdCheck className="w-4 h-4" />
                    ) : (
                      <MdContentCopy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {copied && <p className="text-sm text-green-600 mt-1">Посилання скопійовано!</p>}
              </div>

              {/* Поделиться в соцсетях */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Поділитися в:</p>

                {/* Telegram */}
                <button
                  onClick={() => shareToSocial('telegram')}
                  className="w-full flex items-center justify-center gap-3 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  <span>Telegram</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  className="w-full flex items-center justify-center gap-3 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => shareToSocial('facebook')}
                  className="w-full flex items-center justify-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidePanel;
