import mongoose from "mongoose";
import { Bot, InlineKeyboard } from "grammy";
import Support from "../model/Support.js";
import 'dotenv/config';

const DB_URL = process.env.DB_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);

if (!BOT_TOKEN) throw new Error("BOT_TOKEN не встановлено в .env");
if (!ADMIN_ID) throw new Error("ADMIN_ID не встановлено в .env");
if (!DB_URL) throw new Error("DB_URL не встановлено в .env");

// Підключення до MongoDB
mongoose.connect(DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Ініціалізація бота
const bot = new Bot(BOT_TOKEN);

// Об'єкти для зберігання станів
const userState = {};
const operatorChats = {};
const activeComplaints = {};
const COOLDOWN_MS = 5 * 60 * 1000; // 5 хвилин
const lastComplaintTime = {};
const queue = [];

// Встановлення команд бота
bot.api.setMyCommands([
  { command: "start", description: "Запуск бота" },
  { command: "complaints", description: "Переглянути скарги (оператор)" },
  { command: "contact", description: "Зв'язатися з оператором" },
  { command: "help", description: "Допомога" },
]);

// Обробка /start
bot.command("start", async (ctx) => {
  await ctx.reply(
    "Привіт! Я бот підтримки, чим можу допомогти?",
    {
      reply_markup: new InlineKeyboard()
        .text("📝 Відправити скаргу", "send_complaint")
        .row()
        .text("📞 Зв'язатися з оператором", "contact_operator")
    }
  );
});

// Обробка /help
bot.command("help", async (ctx) => {
  await ctx.reply(
    `Команди бота:
/start — Запуск бота
/complaints — Переглянути скарги (оператор)
/contact — Зв'язатися з оператором
/help — Допомога`
  );
});

// Обробка /complaints (тільки для адміна)
bot.command("complaints", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("Ця команда доступна лише оператору.");
  }

  const complaints = await Support.find({ status: 'pending' }).sort({ date: -1 }).limit(5);

  if (complaints.length === 0) {
    return ctx.reply("Поки немає нових скарг.");
  }

  for (const c of complaints) {
    const text = `📬 Нова скарга:\n\n` +
      `📌 Тема: ${c.subject}\n` +  
      `👤 Від: ${c.name || "користувача"}${c.username ? ` (@${c.username})` : ''}\n` +
      `🆔 ID: ${c.userId}\n` +
      `📅 Дата: ${c.date.toLocaleString()}`;
    
    activeComplaints[c._id] = { userId: c.userId, complaintId: c._id };
    
    await ctx.reply(
      text,
      {
        reply_markup: new InlineKeyboard()
          .text("Відповісти", `start_chat_${c._id}`)
          .text("Вирішити", `resolve_${c._id}`)
      }
    );
  }
});

// Кнопка скасування
bot.callbackQuery("cancel", async (ctx) => {
  const userId = ctx.from.id;
  delete userState[userId];
  if (operatorChats[userId]) delete operatorChats[userId];
  await ctx.reply("Дію скасовано.", { reply_markup: { remove_keyboard: true } });
});

// Відправка скарги
bot.callbackQuery("send_complaint", async (ctx) => {
  const userId = ctx.from.id;

  // Перевірка кулдауну
  const lastTime = lastComplaintTime[userId] || 0;
  const now = Date.now();
  if (now - lastTime < COOLDOWN_MS) {
    const waitSec = Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000);
    await ctx.reply(`Будь ласка, зачекайте ${waitSec} секунд перед наступною скаргою.`);
    return;
  }

  userState[userId] = { step: "choose_category", data: {} };

  await ctx.reply(
    "Оберіть тип проблеми:",
    {
      reply_markup: new InlineKeyboard()
        .text("🧍 Проблема з профілем", "cat_profile")
        .row()
        .text("📍 Проблема з мітками на карті", "cat_marker")
        .row()
        .text("👥 Проблема з друзями", "cat_friends")
        .row()
        .text("📝 Інше", "cat_other")
        .row()
        .text("❌ Скасувати", "cancel")
    }
  );
});

// Вирішення скарги (оператор)
bot.callbackQuery(/^resolve_(.+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCallbackQuery({ text: "Ви не оператор." });

  const complaintId = ctx.match[1];
  await Support.findByIdAndUpdate(complaintId, { status: 'resolved' });
  
  // Видаляємо з активних скарг
  for (const userId in activeComplaints) {
    if (activeComplaints[userId] === complaintId) {
      delete activeComplaints[userId];
      try {
        await bot.api.sendMessage(userId, "✅ Ваша скарга була успішно вирішена оператором.");
      } catch (e) {
        console.log("Не вдалось повідомити користувача:", e.message);
      }
      break;
    }
  }

  await ctx.reply("Скаргу позначено як вирішену.");
  await ctx.deleteMessage();
});

// Вибір категорії скарги
bot.callbackQuery(/^cat_/, async (ctx) => {
  const userId = ctx.from.id;
  const state = userState[userId];

  if (!state || state.step !== "choose_category") {
    await ctx.reply("Будь ласка, почніть спочатку командою /start");
    return;
  }

  const choice = ctx.callbackQuery.data.split("_")[1];

  const typeMap = {
    profile: "Проблема з профілем",
    marker: "Проблема з мітками на карті",
    friends: "Проблема з друзями",
    other: "Інша проблема",
  };

  if (choice === "other") {
    state.step = "waiting_text";
    await ctx.reply("Будь ласка, опишіть свою проблему детальніше");
    return;
  }

  
  await saveComplaintAndNotify(ctx, typeMap[choice], typeMap[choice]);
  lastComplaintTime[userId] = Date.now();
  delete userState[userId];
});

// Обробка тексту від користувача
bot.on("message:text", async (ctx) => {
  const userId = ctx.from.id;
  const state = userState[userId];

  if (state && state.step === "waiting_text") {
    await saveComplaintAndNotify(ctx, "Інша проблема", ctx.message.text);
    lastComplaintTime[userId] = Date.now();
    delete userState[userId];
    return;
  }

  // Якщо це оператор (ADMIN_ID) і він у режимі відповіді
  if (userId === ADMIN_ID && state && state.step === "replying") {
    const targetUserId = state.targetUserId;
    const text = ctx.message.text;
    try {
      await bot.api.sendMessage(targetUserId, `📩 Відповідь від оператора:\n\n${text}`);
      await ctx.reply("Повідомлення відправлено користувачу.");
    } catch {
      await ctx.reply("Не вдалося відправити повідомлення користувачу. Можливо, він заблокував бота.");
    }
    return;
  }

  // Якщо це оператор (ADMIN_ID) і він у чаті з користувачем
  if (userId === ADMIN_ID && operatorChats[ADMIN_ID]) {
    const targetUserId = operatorChats[ADMIN_ID];
    try {
      await bot.api.sendMessage(targetUserId, `📩 Оператор: ${ctx.message.text}`);
      await ctx.reply("Ваше повідомлення надіслано користувачу.");
    } catch {
      await ctx.reply("Не вдалося надіслати повідомлення користувачу.");
    }
    return;
  }

  // Якщо це звичайний користувач і він у чаті з оператором
  if (operatorChats[userId] === ADMIN_ID) {
    try {
      await bot.api.sendMessage(ADMIN_ID, `📞 Користувач (ID: ${userId}): ${ctx.message.text}`);
      await ctx.reply("Ваше повідомлення надіслано оператору.");
    } catch {
      await ctx.reply("Не вдалося надіслати повідомлення оператору.");
    }
    return;
  }
});
// Збереження скарги та сповіщення оператора
async function saveComplaintAndNotify(ctx, subject, message = "") {
  try {
    const finalMessage = message || subject;

    const complaint = new Support({
      userId: ctx.from.id,
      username: ctx.from.username || "",
      name: ctx.from.first_name || "Користувач",
      subject: subject,
      message: finalMessage,
    });
    
    const savedComplaint = await complaint.save();

    activeComplaints[savedComplaint._id] = {
      userId: ctx.from.id,
      complaintId: savedComplaint._id
    };

    await ctx.reply("Дякуємо! Ваше повідомлення передано оператору ✅", {
      reply_markup: { remove_keyboard: true }
    });

    const adminMessage = `📬 Нова скарга:\n\n` +
      `📌 Тема: ${subject}\n` +
      `👤 Від: ${ctx.from.first_name}${ctx.from.username ? ` (@${ctx.from.username})` : ''}\n` +
      `🆔 ID: ${ctx.from.id}\n\n` +
      `✉️ Повідомлення:\n${finalMessage}`;

    await bot.api.sendMessage(ADMIN_ID, adminMessage, {
      reply_markup: new InlineKeyboard()
        .text("Відповісти", `start_chat_${savedComplaint._id}`) 
        .text("Вирішити", `resolve_${savedComplaint._id}`)
    });

  } catch (e) {
    console.error("Помилка збереження скарги:", e);
    await ctx.reply("Виникла помилка при збереженні скарги. Спробуйте пізніше.");
  }
}
// Зв'язок з оператором
bot.callbackQuery("contact_operator", async (ctx) => {
  const userId = ctx.from.id;

  // Перевірка чи користувач вже в черзі
  const inQueue = queue.some(user => user.id === userId);
  if (inQueue) {
    return ctx.reply("Ви вже в черзі на з'єднання з оператором.");
  }

  // Перевірка чи користувач вже в чаті з оператором
  if (operatorChats[userId]) {
    return ctx.reply("Ви вже спілкуєтеся з оператором.");
  }

  // Додаємо користувача в чергу
  queue.push({
    id: userId,
    name: ctx.from.first_name || "Користувач",
    username: ctx.from.username
  });

  await ctx.reply("⌛ Вас додано в чергу на з'єднання з оператором. Очікуйте, скоро з вами зв'яжуться.");
  
  // Сповіщаємо оператора про нового користувача в черзі
  try {
    await bot.api.sendMessage(
      ADMIN_ID,
      `🆕 Новий запит в черзі від ${ctx.from.first_name}${ctx.from.username ? ` (@${ctx.from.username})` : ''} [ID: ${userId}]\n\nЗагальна кількість в черзі: ${queue.length}`,
      {
        reply_markup: new InlineKeyboard()
          .text("Переглянути чергу", "view_queue")
      }
    );
  } catch (e) {
    console.error("Не вдалося сповістити оператора:", e);
  }
});

// Обробка кнопки "Переглянути чергу"
bot.callbackQuery("view_queue", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCallbackQuery({ text: "Ви не оператор." });

  if (queue.length === 0) {
    return ctx.reply("Черга пуста.");
  }

  let message = "📋 Черга запитів на чат:\n\n";
  queue.forEach((user, index) => {
    message += `${index + 1}. ${user.name}${user.username ? ` (@${user.username})` : ''} [ID: ${user.id}]\n`;
  });

  await ctx.editMessageText(message, {
    reply_markup: new InlineKeyboard()
      .text("Прийняти першого в черзі", "accept_first")
  });
});

// Обробка кнопки "Прийняти першого в черзі"
bot.callbackQuery("accept_first", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCallbackQuery({ text: "Ви не оператор." });

  if (queue.length === 0) {
    return ctx.answerCallbackQuery({ text: "Черга пуста." });
  }

  const firstUser = queue.shift(); // Видаляємо першого користувача з черги

  // Встановлюємо з'єднання
  operatorChats[ADMIN_ID] = firstUser.id;
  operatorChats[firstUser.id] = ADMIN_ID;

  // Сповіщаємо користувача
  try {
    await bot.api.sendMessage(
      firstUser.id,
      "✅ Оператор прийняв ваш запит. Тепер ви можете спілкуватися."
    );
  } catch (e) {
    console.error("Не вдалося сповістити користувача:", e);
  }

  await ctx.editMessageText(
    `Ви почали чат з користувачем ${firstUser.name}${firstUser.username ? ` (@${firstUser.username})` : ''} [ID: ${firstUser.id}]`,
    {
      reply_markup: new InlineKeyboard()
        .text("Завершити чат", `end_chat_${firstUser.id}`)
    }
  );
});

// Оновлений обробник завершення чату
bot.callbackQuery(/^end_chat_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCallbackQuery({ text: "Ви не оператор." });

  const targetUserId = Number(ctx.match[1]);
  
  // Сповіщаємо користувача
  try {
    await bot.api.sendMessage(
      targetUserId,
      "✅ Чат з оператором завершено. Дякуємо за звернення!"
    );
  } catch (e) {
    console.error("Не вдалося сповістити користувача:", e);
  }

  // Видаляємо з активних чатів
  delete operatorChats[ADMIN_ID];
  delete operatorChats[targetUserId];
  
  await ctx.editMessageText(`Чат з користувачем ${targetUserId} завершено.`);
});

// Оператор починає чат
bot.callbackQuery(/^start_chat_(.+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCallbackQuery({ text: "Ви не оператор." });

  const complaintId = ctx.match[1];
  
  // Перевіряємо, чи є скарга в activeComplaints
  if (!activeComplaints[complaintId]) {
    // Якщо немає, шукаємо в базі
    const complaint = await Support.findById(complaintId);
    
    if (!complaint || complaint.status !== 'pending') {
      return ctx.answerCallbackQuery({ text: "Скарга не знайдена або вже вирішена" });
    }
    
    // Додаємо до активних
    activeComplaints[complaintId] = {
      userId: complaint.userId,
      complaintId: complaint._id
    };
  }

  const complaintData = activeComplaints[complaintId];
  
  // Ініціалізуємо чат
  operatorChats[ADMIN_ID] = complaintData.userId;
  operatorChats[complaintData.userId] = ADMIN_ID;
  userState[ADMIN_ID] = { step: "replying", targetUserId: complaintData.userId };

  try {
    await bot.api.sendMessage(
      complaintData.userId, 
      "💬 Оператор приєднався до чату з вами."
    );
  } catch (e) {
    console.log("Не вдалося повідомити користувача:", e.message);
  }

  await ctx.reply(
    `Ви почали чат з користувачем ${complaintData.userId} по скарзі #${complaintId}.`,
    {
      reply_markup: new InlineKeyboard()
        .text("✅ Завершити чат", `end_chat_${complaintId}`)
    }
  );

  await ctx.deleteMessage();
});

// Завершення чату оператором (для чату через скаргу)
bot.callbackQuery(/^end_chat_(.+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCallbackQuery({ text: "Ви не оператор." });

  const complaintId = ctx.match[1];
  
  // Знаходимо інформацію про скаргу
  const complaintData = activeComplaints[complaintId];
  
  if (!complaintData) {
    return ctx.reply("Скарга не знайдена або вже вирішена.");
  }

  try {
    // Оновлюємо конкретну скаргу
    await Support.findByIdAndUpdate(complaintId, { status: 'resolved' });
    
    // Видаляємо з активних скарг
    delete activeComplaints[complaintId];
    
    // Сповіщаємо користувача
    try {
      await bot.api.sendMessage(
        complaintData.userId, 
        "✅ Оператор завершив чат. Ваша скарга вирішена."
      );
    } catch (e) {
      console.log("Не вдалось повідомити користувача:", e.message);
    }

    await ctx.reply(`Чат завершено. Скарга #${complaintId} позначена як вирішена.`);
    await ctx.deleteMessage();

  } catch (e) {
    console.error("Помилка при оновленні статусу скарги:", e);
    await ctx.reply("Сталася помилка при оновленні статусу скарги.");
  }

  // Завершуємо чат
  delete operatorChats[ADMIN_ID];
  delete operatorChats[complaintData.userId];
  delete userState[ADMIN_ID];
});

// Запуск бота
bot.start();
console.log("Бот запущено");

// Обробка завершення роботи
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());