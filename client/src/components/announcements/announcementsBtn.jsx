import React from 'react';
import { FaBullhorn } from 'react-icons/fa';

function ActionButton({ onClick }) {
  return (
    <button
      className="fixed bottom-10 left-5 z-[1000] px-4 py-2 bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 rounded-md shadow-lg
          hover:bg-indigo-50 dark:hover:bg-gray-700 active:bg-indigo-100 dark:active:bg-gray-600 transition-colors duration-200 
          flex items-center gap-2 border-2 border-indigo-500 dark:border-indigo-400 font-medium"
      onClick={onClick}
    >
      <FaBullhorn className="text-xl" />
      Створити
    </button>
  );
}

export default ActionButton;
