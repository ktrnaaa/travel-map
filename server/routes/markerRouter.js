// server/routes/markerRoutes.js
import express from 'express';

import { createMarker, getMarkers, updateMarker, deleteMarker } from '../controller/marker.js';

const router = express.Router();

router.post('/marker', createMarker); // Создание
router.get('/markers', getMarkers); // Чтение
router.put('/marker/:id', updateMarker); // Обновление
router.delete('/marker/:id', deleteMarker); // Удаление

export default router;
