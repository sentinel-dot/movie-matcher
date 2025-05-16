import express, { Router } from 'express';
import { RequestHandler } from 'express';
import { signup, login, me } from '../controllers/auth';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// Public routes
router.post('/signup', signup as RequestHandler);
router.post('/login', login as RequestHandler);

// Protected routes
router.get('/me', auth as RequestHandler, me as RequestHandler);

export default router;