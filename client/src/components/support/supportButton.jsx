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
      className="fixed bottom-5 left-5 z-[1000] px-4 py-2 bg-blue-600 text-white rounded-md shadow-md 
               hover:scale-105 active:scale-95 transition-transform duration-200"
    >
      Підтримка
    </button>
  );
}
