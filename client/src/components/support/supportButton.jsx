import React from 'react';
import { FaHeadset } from 'react-icons/fa'; // Иконка для поддержки

export default function SupportButton({ onClick }) {
  const handleClick = () => {
    console.log('click');
    if (typeof onClick === 'function') {
      onClick();
    } else {
      console.warn('onClick не є функцією');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-10 right-5 z-[1000] px-4 py-2 bg-gray-800 text-white rounded-md shadow-md
               hover:bg-gray-700 active:bg-gray-600 transition-colors duration-200 flex items-center gap-2
               backdrop-blur-md bg-opacity-70"
    >
      <FaHeadset className="text-xl" />
      Підтримка
    </button>
  );
}
