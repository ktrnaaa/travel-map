import express from 'express';
import { register, login, updateProfile } from './../controller/authCntrl.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/profile', updateProfile);

export default router;