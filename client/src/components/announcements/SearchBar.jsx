import React, { useState } from 'react';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSearch = () => setIsOpen(prev => !prev);

  return (
    <>
      {/* Кнопка "Оголошення" */}
      <button
        onClick={toggleSearch}
        className="fixed bottom-25 left-5 z-[9999] px-4 py-2 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 rounded-md shadow-lg
          hover:bg-indigo-50 dark:hover:bg-gray-700 active:bg-indigo-100 dark:active:bg-gray-600 transition-colors duration-200
          flex items-center gap-2 border-2 border-indigo-500 dark:border-indigo-400 font-medium"
      >
        Пропозиції
      </button>

      {/* Панель пошуку */}
      <div
        className={`fixed left-1/2 transform -translate-x-1/2 w-100 p-3 bg-white rounded-lg shadow-md flex items-center gap-3 z-[9999] transition-[top] duration-300 ease-in-out
    ${isOpen ? 'top-16' : '-top-28'}
  `}
      >
        <input
          type="text"
          placeholder="Пошук..."
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
          Показати всі
        </button>
      </div>
    </>
  );
}
