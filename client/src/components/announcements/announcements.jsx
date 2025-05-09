import React from 'react';

function ActionButton() {
  const handleClick = () => {
    console.log('Кнопка нажата');
  };

  return (
    <button
      className="fixed bottom-20 left-5 z-[1000] px-4 py-2 bg-blue-600 text-white rounded-md shadow-md
               hover:scale-105 active:scale-95 transition-transform duration-200"
      onClick={handleClick}
    >
      Оголошення
    </button>
  );
}

export default ActionButton;
