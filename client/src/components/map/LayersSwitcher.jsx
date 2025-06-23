import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { FaMap, FaSatellite, FaLayerGroup } from 'react-icons/fa';
import { GiCompass } from 'react-icons/gi';

const LayersSwitcher = ({ mapType, setMapType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Обработчик клика вне компонента для закрытия меню
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div ref={menuRef} className="relative">
      {/* Основная иконка слоев */}
      <button
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg
                  hover:bg-gray-100 transition-all duration-300 z-20 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaLayerGroup className="text-2xl text-gray-700" />
      </button>

      {/* Выпадающее меню при клике */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="absolute top-full right-0 mt-2 flex flex-col space-y-2 z-10">
              <button
                onClick={() => {
                  setMapType('standard');
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all duration-300
                      ${mapType === 'standard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              >
                <FaMap className="text-xl" />
                <span>Стандартна</span>
              </button>

              <button
                onClick={() => {
                  setMapType('satellite');
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all duration-300
                      ${mapType === 'satellite' ? 'bg-orange-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              >
                <FaSatellite className="text-xl" />
                <span>Супутникова</span>
              </button>

              <button
                onClick={() => {
                  setMapType('topographic');
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all duration-300
                      ${mapType === 'topographic' ? 'bg-green-500 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              >
                <GiCompass className="text-xl" />
                <span>Топографічна</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LayersSwitcher;
