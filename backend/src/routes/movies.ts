import express, { Router } from 'express';
import { RequestHandler } from 'express';
import { getMovies, getMovieById } from '../controllers/movies';

const router: Router = express.Router();

// Public routes
router.get('/', getMovies as RequestHandler);
router.get('/:id', getMovieById as RequestHandler);

export default router;