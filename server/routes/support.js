import express from 'express';

import Support from '../model/Support.js';
const router = express.Router();

router.post('/support', async (req, res) => {
  const { name, email, subject, message } = req.body;

  const newSupport = new Support({ name, email, subject, message });
  await newSupport.save();

  console.log('Отримано звернення до підтримки:');
  console.log({ name, email, subject, message });

  res.status(200).json({ message: 'Звернення прийнято' });
});

export default router;
