import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { FaTelegram, FaTimes } from 'react-icons/fa';
import { FiHelpCircle } from 'react-icons/fi';

export default function ContactSupport({ onOpenForm, telegramLink }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-10 right-5 z-[1000]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-full shadow-md
                 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 border border-gray-200"
      >
        {isOpen ? (
          <>
            <FaTimes className="text-xl text-gray-700" />
            <span className="font-medium">Закрити</span>
          </>
        ) : (
          <>
            <FiHelpCircle className="text-2xl text-gray-700" />
            <span className="font-medium">Підтримка</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-md shadow-lg p-3 w-[250px]"
          >
            <h3 className="text-center font-medium mb-3 text-gray-800 dark:text-white">
              Виберіть спосіб зв'язку:
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (typeof onOpenForm === 'function') onOpenForm();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700
                        text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <FiHelpCircle />
                Написати на e-mail
              </button>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0088cc]
                        text-white rounded-md hover:bg-[#0077b3] transition-colors"
              >
                <FaTelegram />
                Написати в Telegram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
