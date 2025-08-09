import { Schema, model } from 'mongoose';

const supportSchema = new Schema({
  userId: { type: Number },  // Додано ID користувача з Telegram
  username: String,                         // Юзернейм 
  name: String,                             // Ім'я користувача
  email: String,                            // Email 
  subject: { type: String, required: true },// Тема повідомлення
  message: { type: String, required: true },// Текст скарги/питання
  date: { type: Date, default: Date.now },  // Дата створення
  status: {                                 // Статус обробки
    type: String,
    default: 'pending',                     // pending / resolved
    enum: ['pending', 'resolved'],          // Обмеження значень
  },
}, { collection: 'user-report' });          // Явно вказуємо колекцію

export default model('Support', supportSchema);