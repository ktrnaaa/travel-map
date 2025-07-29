import React, { useState } from 'react';
import { FaGoogle, FaUser, FaLock } from 'react-icons/fa';
import LoginTelegramButton from './TelegramLoginButton';
import axios from 'axios';

 const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Скидаємо помилку при зміні
    setSuccess(''); // Скидаємо успіх при зміні
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Форма відправлена, isRegister:', isRegister); // Діагностика
    console.log('Дані форми:', formData);

    if (isRegister) {
      // Логіка реєстрації
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Усі поля є обов’язковими');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Паролі не збігаються');
        return;
      }
      try {
        console.log('Відправка на /api/register...');
        const response = await axios.post('http://localhost:4000/api/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        console.log('Відповідь від сервера:', response.data);
        setSuccess('Реєстрація успішна! Ви можете увійти.');
        setFormData({ username: '', email: '', password: '', confirmPassword: '' }); // Скидання форми
        localStorage.setItem('token', response.data.token); // Збереження токена
      } catch (error) {
        console.error('Помилка реєстрації:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'Помилка реєстрації. Спробуйте ще раз.');
      }
    } else {
      // Логіка входу
      if (!formData.email || !formData.password) {
        setError('Email і пароль є обов’язковими');
        return;
      }
      try {
        console.log('Відправка на /api/login...');
        const response = await axios.post('http://localhost:4000/api/login', {
          email: formData.email,
          password: formData.password,
        });
        console.log('Відповідь від сервера:', response.data);
        setSuccess('Успішний вхід!');
        localStorage.setItem('token', response.data.token); // Збереження токена
        // TODO: Перенаправлення на іншу сторінку (наприклад, профіль)
      } catch (error) {
        console.error('Помилка входу:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'Невірні облікові дані.');
      }
    }
  };

  const handleGoogleLogin = () => {
    // TODO: логіка Google Login
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#F4EFFF] to-[#744ce9]/10">
      <form
        className="bg-white p-10 rounded-xl shadow-md w-full max-w-md transition-all duration-300"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-[#744ce9] drop-shadow">
          {isRegister ? 'Реєстрація' : 'Вхід'}
        </h2>

        {isRegister && (
          <div className="relative mb-5">
            <FaUser className="absolute left-3 top-4 text-[#744ce9]" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Логін"
              className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
            />
          </div>
        )}

        <div className="relative mb-5">
          <FaUser className="absolute left-3 top-4 text-[#744ce9]" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
          />
        </div>

        <div className="relative mb-5">
          <FaLock className="absolute left-3 top-4 text-[#744ce9]" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Пароль"
            className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
          />
        </div>

        {isRegister && (
          <div className="relative mb-5">
            <FaLock className="absolute left-3 top-4 text-[#744ce9]" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Підтвердіть пароль"
              className="w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#744ce9] transition-all"
            />
          </div>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
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
            aria-label="Увійти через Google"
          >
            <FaGoogle className="text-red-500" />
          </button>

          {/* Кнопка Telegram */}
          <LoginTelegramButton />
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