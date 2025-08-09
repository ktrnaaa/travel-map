import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function SupportModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { status } = await axios.post('http://localhost:4000/support', form);
      if (status === 200) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Помилка при надсиланні:', err);
      alert('Щось пішло не так. Спробуйте пізніше.');
    }
  };

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{
            opacity: 1,
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0,0,0,0.5)',
            transition: { duration: 0.3 },
          }}
          exit={{
            opacity: 0,
            backdropFilter: 'blur(0px)',
            transition: { duration: 0.3, ease: 'easeInOut' },
          }}
          style={{ zIndex: 1000 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: -10,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            }}
            className="relative w-full max-w-md mx-4 bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl shadow-xl"
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-5 sm:p-6 pb-7 rounded-t-2xl">
              <h3 className="text-xl sm:text-3xl font-semibold text-white leading-tight">
                Звернення до підтримки
              </h3>
              <p className="text-blue-100 mt-1 text-lg">
                Напишіть нам своє питання або проблему
              </p>

              <div className="absolute top-3 right-3">
                <motion.button
                  onClick={handleClose}
                  title="Закрити"
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTimes />
                </motion.button>
              </div>

              <div className="absolute -bottom-4 left-0 right-0 h-8 bg-white rounded-full"></div>
            </div>

            {submitted ? (
              <motion.div
                className="p-6 text-center space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h2
                  className="text-2xl font-semibold text-green-600"
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                >
                  Дякуємо за звернення!
                </motion.h2>
                <motion.p className="text-gray-600" initial={{ y: 10 }} animate={{ y: 0 }}>
                  Ми зв'яжемося з вами якнайшвидше.
                </motion.p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="p-5 sm:p-6 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="group">
                  <label
                    htmlFor="name"
                    className="inline-block text-base font-semibold uppercase text-gray-500 mb-1.5 group-focus-within:text-blue-600 transition duration-200"
                  >
                    Ім'я
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none hover:border-gray-300 transition duration-200 text-sm sm:text-base"
                    placeholder="Ваше ім'я"
                    required
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="email"
                    className="inline-block text-base font-semibold uppercase text-gray-500 mb-1.5 group-focus-within:text-blue-600 transition duration-200"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none hover:border-gray-300 transition duration-200 text-sm sm:text-base"
                    placeholder="Ваш email"
                    required
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="subject"
                    className="inline-block text-base font-semibold uppercase text-gray-500 mb-1.5 group-focus-within:text-blue-600 transition duration-200"
                  >
                    Тема
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none hover:border-gray-300 transition duration-200 text-sm sm:text-base"
                    placeholder="Тема звернення"
                    required
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="message"
                    className="inline-block text-base font-semibold uppercase text-gray-500 mb-1.5 group-focus-within:text-blue-600 transition duration-200"
                  >
                    Повідомлення
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:outline-none hover:border-gray-300 transition duration-200 text-sm sm:text-base resize-none"
                    placeholder="Опишіть ваше питання детально"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="order-2 sm:order-1 px-5 py-2.5 sm:flex-1 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    style={{
                      backgroundColor: '#dc2626',
                      cursor: 'pointer',
                      border: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="order-1 sm:order-2 px-5 py-2.5 sm:flex-1 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    style={{
                      backgroundColor: '#32CD32',
                      cursor: 'pointer',
                      border: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2EB94D'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#32CD32'}
                  >
                    Надіслати
                  </button>
                </div>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}