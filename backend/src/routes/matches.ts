import express, { Router } from 'express';
import { RequestHandler } from 'express';
import { getMatches, getMatchById } from '../controllers/matches';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// All match routes are protected
router.use(auth as RequestHandler);

// Protected routes
router.get('/', getMatches as RequestHandler);
router.get('/:id', getMatchById as RequestHandler);

export default router;