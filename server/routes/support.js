import express from 'express';

import Support from '../model/Support.js';
import { supportLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

// Застосовуємо лімiтер до маршруту
router.post('/support', supportLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Усі поля обов\'язкові' });
    }

    const newSupport = new Support({ name, email, subject, message });
    await newSupport.save();

    console.log('Отримано звернення до підтримки:');
    console.log({ name, email, subject, message });

    res.status(200).json({ message: 'Звернення прийнято' });
  } catch (error) {
    console.error('Помилка при збереженні звернення:', error);
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

export default router;