import React from 'react';
import { FaBullhorn } from 'react-icons/fa';

function AnnouncementButton({ onClick }) {
  return (
    <button
      className="fixed bottom-8 left-5 z-[1000] p-3 bg-white text-gray-700 rounded-full shadow-md
                 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 border border-gray-200
                 flex items-center justify-center"
      onClick={onClick}
      title="Створити оголошення"
    >
      <FaBullhorn className="text-3xl" />
    </button>
  );
}

export default AnnouncementButton;
