import React, { useState } from 'react';
import { FaGoogle, FaTelegramPlane, FaUser, FaLock } from 'react-icons/fa';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  const handleGoogleLogin = () => {
    // TODO: реалізувати логіку входу через Google
  };

  const handleTelegramLogin = () => {
    // TODO: реалізувати логіку входу через Telegram
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F4EFFF] to-[#744ce9]/10">
      <form className="bg-white p-10 rounded-xl shadow-md w-full max-w-md transition-all duration-300">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#744ce9] drop-shadow">
          {isRegister ? 'Реєстрація' : 'Вхід'}
        </h2>
        <div className="relative mb-5">
          <FaUser className="absolute left-3 top-4 text-[#744ce9]" />
          <input
            type="text"
            placeholder="Логін"
            className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
          />
        </div>
        <div className="relative mb-5">
          <FaUser className="absolute left-3 top-4 text-[#744ce9]" />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
          />
        </div>
        <div className="relative mb-5">
          <FaLock className="absolute left-3 top-4 text-[#744ce9]" />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
          />
        </div>
        {isRegister && (
          <div className="relative mb-5">
            <FaLock className="absolute left-3 top-4 text-[#744ce9]" />
            <input
              type="password"
              placeholder="Підтвердіть пароль"
              className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-[#744ce9] text-white py-3 rounded-lg font-semibold hover:bg-[#5d39b3] transition mb-4 shadow"
        >
          {isRegister ? 'Зареєструватися' : 'Увійти'}
        </button>
        <div className="flex gap-4 justify-center mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center bg-white border border-[#D1D5DB] p-3 rounded-full shadow text-xl hover:bg-[#f3f3f3] transition"
            aria-label="Войти через Google"
          >
            <FaGoogle className="text-red-500" />
          </button>
          <button
            type="button"
            onClick={handleTelegramLogin}
            className="flex items-center justify-center bg-[#229ED9] border border-[#229ED9] p-3 rounded-full shadow text-xl hover:bg-[#178bb7] transition"
            aria-label="Войти через Telegram"
          >
            <FaTelegramPlane className="text-white" />
          </button>
        </div>
        <div className="text-center">
          <button
            type="button"
            className="text-[#744ce9] hover:underline font-medium"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Вже є акаунт? Увійти' : 'Немає акаунта? Зареєструватися'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
