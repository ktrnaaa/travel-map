import express from "express";

import UserModel from "../model/annoucementsModel.js";

const router = express.Router();

router.post('/annoucementsAdding', async (req, res) => { // Добавлен параметр res
  const { title, description } = req.body; // Изменили name на title
  console.log(`В БД передано: 
              title: ${title}
              description: ${description}`);
  
  try {
    const doc = new UserModel();
    doc.title = title; // Изменили name на title
    doc.description = description;
    await doc.save();
    res.status(200).send('Оголошення збережено'); // Добавляем ответ
  } catch (error) {
    console.error('Помилка збереження:', error);
    res.status(500).send('Помилка сервера');
  }
});

export default router;