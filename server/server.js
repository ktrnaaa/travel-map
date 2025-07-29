import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import express from 'express';
import createHttpError from 'http-errors';
import morgan from 'morgan';

// Роути
import announcementsRouter from './routes/annoucementsAdding.js';
import getReportsRouter from './routes/main.js';
import marker from './routes/markerRouter.js';
import profileEdditRouter from './routes/profileChanges.js';
import supportRouter from './routes/support.js';
import authRouter from './routes/auth.js'
const app = express();

// Middleware
app.use(morgan('combined'));
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());

// Шляхи до статичних файлів
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../client')));

// Підключення роутів тут
app.use('/', announcementsRouter);
app.use('/', supportRouter);
app.use('/', getReportsRouter);
app.use('/', profileEdditRouter);
app.use('/', marker);
app.use('/api', authRouter);

// Обробка 404
app.use((req, res, next) => {
  next(createHttpError(404));
});

// Обробник помилок
app.use((err, req, res) => {
  const { status = 500, message = 'Internal Server Error' } = err;
  console.error(status, message);
  res.status(status).json({ error: message });
});

export default app;
