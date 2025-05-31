import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaTimes, FaAdjust } from 'react-icons/fa';

export default function AnnouncementModal({ onClose, toggleTheme, currentTheme }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async ev => {
    ev.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post('http://localhost:4000/annoucementsAdding', {
        title: form.title,
        description: form.description,
      });
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Помилка при відправці:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
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
            className={`relative w-full max-w-2xl mx-4 p-6 rounded-xl shadow-lg ${currentThemeClass.bg} ${currentThemeClass.text}`}
          >
            <div className="absolute top-3 right-3 flex gap-2">
              <motion.button
                onClick={toggleTheme}
                title="Змінити тему"
                className={`p-2 rounded-full ${currentThemeClass.iconButton} transition-colors`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaAdjust />
              </motion.button>

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
                  Пропозицію опубліковано!
                </motion.h2>
                <motion.p initial={{ y: 10 }} animate={{ y: 0 }}>
                  Дякуємо за ваш внесок.
                </motion.p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.h2
                  className="text-3xl font-bold text-center mb-6"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                >
                  Створення пропозиції
                </motion.h2>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <input
                    name="title"
                    onChange={handleChange}
                    placeholder="Заголовок"
                    className={`w-full text-3xl p-2 focus:outline-none border-b ${currentThemeClass.border} ${currentThemeClass.input}`}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={`w-full text-xl p-2 focus:outline-none border rounded min-h-[200px] ${currentThemeClass.border} ${currentThemeClass.input}`}
                    placeholder="Опис"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-semibold text-white text-2xl ${currentThemeClass.button} transition-colors`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Відправляється...' : 'Опублікувати'}
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
