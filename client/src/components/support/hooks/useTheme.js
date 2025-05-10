
import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Отримуємо тему з localStorage або використовуємо 'dark' за замовчуванням
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeToApply) => {
    // Оновлюємо клас на documentElement
    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme); // Застосовуємо нову тему
  };

  return { theme, toggleTheme };
}