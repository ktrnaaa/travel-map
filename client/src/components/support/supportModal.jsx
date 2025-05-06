import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaAdjust, FaTools, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function SupportModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [view, setView] = useState('form'); // додаємо стейт для управління видом (форма чи адмінка)
  const [reports, setReports] = useState([]); // для збереження списку репортів

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleClose = () => { if (isClosing) return; setIsClosing(true); setIsVisible(false); };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { status } = await axios.post('http://localhost:4000/support', form);
      if (status === 200) {
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); handleClose(); }, 2000);
      }
    } catch (err) {
      console.error('Помилка при надсиланні:', err);
      alert('Щось пішло не так. Спробуйте пізніше.');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Для отримання репортів з сервера (можна налаштувати API)
  useEffect(() => {
    if (view === 'admin') {
      axios.get('http://localhost:4000/support') // Заміни на своє API
        .then(res => setReports(res.data))
        .catch(err => console.error('Помилка при отриманні репортів:', err));
    }
  }, [view]);

  return (
    isVisible && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: isVisible ? 'flex' : 'none', zIndex: 1000 }}
        onAnimationComplete={(def) => {
          if (def === 'exit') {
            console.log('Анімація завершена, викликаємо onClose');
            if (typeof onClose === 'function') onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={`relative w-full max-w-md p-6 rounded-xl shadow-lg transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1e1b4b] text-white' : 'bg-[#d1fae5] text-[#065f46]'}`}
        >
          <div className="absolute top-3 right-3 flex gap-3">
            <button onClick={toggleTheme} title="Змінити тему"><FaAdjust /></button>
            {view === 'form' && (
              <button onClick={() => setView('admin')} title="Адмінка"><FaTools /></button>
            )}
            <button onClick={handleClose} title="Закрити"><FaTimes /></button>
          </div>

          {view === 'admin' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Адмінка: Репорти</h2>
                <button
                  onClick={() => setView('form')}
                  className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                >
                  <FaArrowLeft /> Назад
                </button>
              </div>
              <div className="space-y-2">
                {reports.length > 0 ? (
                  reports.map((report, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <h3 className="font-semibold">{report.subject}</h3>
                      <p>{report.message}</p>
                      <p className="text-sm text-gray-500">{report.date}</p>
                    </div>
                  ))
                ) : (
                  <p>Немає репортів.</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {submitted ? (
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Дякуємо за звернення!</h2>
                  <p>Ми зв’яжемося з вами якнайшвидше.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                  <h2 className="text-2xl font-bold text-center mb-4">Звернення до підтримки</h2>

                  <div><label className="block mb-1">Ім'я:</label><input name="name" value={form.name} onChange={handleChange} required className="w-full p-2 rounded border border-gray-400 bg-transparent outline-none" /></div>
                  <div><label className="block mb-1">Email:</label><input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full p-2 rounded border border-gray-400 bg-transparent outline-none" /></div>
                  <div><label className="block mb-1">Тема:</label><input name="subject" value={form.subject} onChange={handleChange} required className="w-full p-2 rounded border border-gray-400 bg-transparent outline-none" /></div>
                  <div><label className="block mb-1">Повідомлення:</label><textarea name="message" rows="4" value={form.message} onChange={handleChange} required className="w-full p-2 rounded border border-gray-400 bg-transparent outline-none resize-none" /></div>

                  <button type="submit" className={`w-full py-2 rounded font-semibold transition ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
                    Надіслати
                  </button>
                </form>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    )
  );
}
