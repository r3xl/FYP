import express from 'express';
import { registerUser, loginUser } from '../controller/authController.js'; // Ensure correct import path

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router; // Use ES module export
