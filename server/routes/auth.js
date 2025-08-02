import express from 'express';
import { register, login, updateProfile, getRefreshToken } from './../controller/authCntrl.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/profile', updateProfile);
router.post('/api/refresh-token', getRefreshToken);

export default router;