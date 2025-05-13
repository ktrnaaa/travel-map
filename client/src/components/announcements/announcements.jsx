import React from 'react';
import { FaBullhorn } from 'react-icons/fa'; // Иконка для объявления

function ActionButton() {
  const handleClick = () => {
    console.log('Кнопка нажата');
  };

  return (
    <button
      className="fixed bottom-10 left-5 z-[1000] px-4 py-2 bg-white text-indigo-700 rounded-md shadow-lg
          hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-200 flex items-center gap-2
          border-2 border-indigo-500 font-medium"
      onClick={handleClick}
    >
      <FaBullhorn className="text-xl" />
      Оголошення
    </button>
  );
}

export default ActionButton;
