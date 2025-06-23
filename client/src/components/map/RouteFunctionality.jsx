import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { FaRoute } from 'react-icons/fa';

export default function RouteFunctionality() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-center p-2 bg-white text-gray-700 rounded-full shadow-md
                 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 border border-gray-200"
        title="Погода"
      >
        <FaRoute className="text-3xl" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-full shadow-lg p-4 w-[300px] z-50"
          >
            {/* ... содержимое виджета ... */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
