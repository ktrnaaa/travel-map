import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { FaTimes, FaAdjust, FaTools, FaArrowLeft } from 'react-icons/fa';

export default function SupportModal({ onClose, toggleTheme, currentTheme }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState('form');
  const [reports, setReports] = useState([]);
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

  useEffect(() => {
    if (view === 'admin') {
      axios
        .get('http://localhost:4000/support')
        .then(res => setReports(res.data))
        .catch(err => console.error('Помилка при отриманні репортів:', err));
    }
  }, [view]);

  const themeClasses = {
    dark: {
      bg: 'bg-[#1e1b4b]',
      text: 'text-white',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      input: 'bg-gray-800 border-gray-600',
      card: 'bg-gray-800',
      border: 'border-gray-600',
      textMuted: 'text-gray-400',
      iconButton: 'hover:bg-gray-700',
    },
    light: {
      bg: 'bg-[#d1fae5]',
      text: 'text-[#065f46]',
      button: 'bg-emerald-500 hover:bg-emerald-600',
      input: 'bg-white border-gray-300',
      card: 'bg-white',
      border: 'border-gray-300',
      textMuted: 'text-gray-500',
      iconButton: 'hover:bg-gray-200',
    },
  };

  const currentThemeClass = themeClasses[currentTheme];

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
            className={`relative w-full max-w-md mx-4 p-6 rounded-xl shadow-lg ${currentThemeClass.bg} ${currentThemeClass.text}`}
          >
            <div className="absolute top-3 right-3 flex gap-2">
              {view === 'admin' && (
                <motion.button
                  onClick={() => setView('form')}
                  title="Назад"
                  className={`p-2 rounded-full ${currentThemeClass.iconButton} transition-colors`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaArrowLeft />
                </motion.button>
              )}

              <motion.button
                onClick={toggleTheme}
                title="Змінити тему"
                className={`p-2 rounded-full ${currentThemeClass.iconButton} transition-colors`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaAdjust />
              </motion.button>

              {view === 'form' && (
                <motion.button
                  onClick={() => setView('admin')}
                  title="Адмінка"
                  className={`p-2 rounded-full ${currentThemeClass.iconButton} transition-colors`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTools />
                </motion.button>
              )}

              <motion.button
                onClick={handleClose}
                title="Закрити"
                className={`p-2 rounded-full ${currentThemeClass.iconButton} transition-colors`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaTimes />
              </motion.button>
            </div>

            {view === 'admin' ? (
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Адмінка: Репорти</h2>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {reports.length > 0 ? (
                    reports.map((report, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg ${currentThemeClass.card} ${currentThemeClass.border} border`}
                      >
                        <h3 className="font-semibold">{report.subject}</h3>
                        <p className="mt-1">{report.message}</p>
                        <p className={`text-sm mt-2 ${currentThemeClass.textMuted}`}>
                          {report.date}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center py-4">Немає репортів</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {submitted ? (
                  <motion.div
                    className="text-center space-y-2 mt-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.h2
                      className="text-2xl font-semibold"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                    >
                      Дякуємо за звернення!
                    </motion.h2>
                    <motion.p initial={{ y: 10 }} animate={{ y: 0 }}>
                      Ми зв&apos;яжемося з вами якнайшвидше.
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-4 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.h2
                      className="text-2xl font-bold text-center mb-4"
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                    >
                      Звернення до підтримки
                    </motion.h2>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block mb-1">Ім&apos;я:</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className={`w-full p-2 rounded border ${currentThemeClass.input} outline-none transition-colors`}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block mb-1">Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className={`w-full p-2 rounded border ${currentThemeClass.input} outline-none transition-colors`}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block mb-1">Тема:</label>
                      <input
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        className={`w-full p-2 rounded border ${currentThemeClass.input} outline-none transition-colors`}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="block mb-1">Повідомлення:</label>
                      <textarea
                        name="message"
                        rows="4"
                        value={form.message}
                        onChange={handleChange}
                        required
                        className={`w-full p-2 rounded border ${currentThemeClass.input} outline-none resize-none transition-colors`}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.button
                        type="submit"
                        className={`w-full py-2 rounded font-semibold ${currentThemeClass.button} text-white transition-colors`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Надіслати
                      </motion.button>
                    </motion.div>
                  </motion.form>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
