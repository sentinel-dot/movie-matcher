import express, { Router } from 'express';
import { RequestHandler } from 'express';
import { createSwipe, getUserSwipes } from '../controllers/swipes';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// All swipe routes are protected
router.use(auth as RequestHandler);

// Protected routes
router.post('/', createSwipe as RequestHandler);
router.get('/', getUserSwipes as RequestHandler);

export default router;