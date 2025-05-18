import express, { Router } from 'express';
import { RequestHandler } from 'express';
import { setPartner, getPartner, searchUserByEmail } from '../controllers/users';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// All user routes are protected
router.use(auth as RequestHandler);

// Protected routes
router.post('/partner', setPartner as RequestHandler);
router.get('/partner', getPartner as RequestHandler);
router.get('/search', searchUserByEmail as RequestHandler);

export default router;