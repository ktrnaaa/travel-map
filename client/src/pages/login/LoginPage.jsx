import React, { useState } from 'react';
import { FaGoogle, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

import LoginTelegramButton from './TelegramLoginButton';

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleLogin = () => {
    // TODO: логика Google Login
  };

  const handleResetPassword = e => {
    e.preventDefault();
    // TODO: логика відправки email для відновлення пароля
    setShowReset(false);
    setResetEmail('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F4EFFF] to-[#744ce9]/10">
      <h1 className="sr-only">Авторизація</h1>
      <form
        className="bg-white p-10 rounded-xl shadow-md w-full max-w-md transition-all duration-300"
        onSubmit={e => e.preventDefault()}
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-[#744ce9] drop-shadow">
          {isRegister ? 'Реєстрація' : 'Вхід'}
        </h2>

        {isRegister && (
          <div className="relative mb-5">
            <FaUser className="absolute left-3 top-4 text-[#744ce9]" />
            <input
              type="text"
              placeholder="Логін"
              className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
            />
          </div>
        )}

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
            type={showPassword ? 'text' : 'password'}
            placeholder="Пароль"
            className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
          />
          <button
            type="button"
            className="absolute right-3 top-4 text-[#744ce9] focus:outline-none"
            onClick={() => setShowPassword(v => !v)}
            tabIndex={-1}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>

        {isRegister && (
          <div className="relative mb-5">
            <FaLock className="absolute left-3 top-4 text-[#744ce9]" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Підтвердіть пароль"
              className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
            />
            <button
              type="button"
              className="absolute right-3 top-4 text-[#744ce9] focus:outline-none"
              onClick={() => setShowConfirmPassword(v => !v)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-[#744ce9] text-base text-white py-3 rounded-lg font-semibold hover:bg-[#5d39b3] transition mb-4 shadow"
        >
          {isRegister ? 'Зареєструватися' : 'Увійти'}
        </button>

        <div className="flex gap-4 justify-center mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center bg-white border border-[#D1D5DB] p-3 rounded-full shadow text-xl hover:bg-[#f3f3f3] transition"
            aria-label="Увійти через Google"
          >
            <FaGoogle className="text-red-500" />
          </button>
          <LoginTelegramButton />
        </div>

        <div className="text-center">
          <button
            type="button"
            className="text-sm font-semibold text-[#5d39b3] hover:underline transition-colors drop-shadow-sm"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Вже є акаунт? Увійти' : 'Немає акаунта? Зареєструватися'}
          </button>
        </div>

        {!isRegister && (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              className="text-sm font-semibold text-[#5d39b3] hover:underline transition-colors drop-shadow-sm"
              onClick={() => setShowReset(true)}
            >
              Забули пароль?
            </button>
          </div>
        )}
      </form>

      {/* Модальне вікно для відновлення пароля */}
      {showReset && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
              onClick={() => setShowReset(false)}
              aria-label="Закрити модальне вікно"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-[#744ce9] text-center">
              Відновлення пароля
            </h3>
            <form onSubmit={handleResetPassword}>
              <input
                type="email"
                required
                placeholder="Уведіть ваш email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                className="w-full mb-4 px-4 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
              />
              <button
                type="submit"
                className="w-full bg-[#744ce9] text-white py-3 rounded-lg font-semibold hover:bg-[#5d39b3] transition shadow"
              >
                Відправити
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
