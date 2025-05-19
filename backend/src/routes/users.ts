import express, { Router } from 'express';
import { RequestHandler } from 'express';
import {
  setPartner,
  getPartner,
  removePartner,
  searchUserByEmail,
  createPartnerRequest,
  getPartnerRequests,
  getPendingPartnerRequests,
  respondToPartnerRequest
} from '../controllers/users';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

// All user routes are protected
router.use(auth as RequestHandler);

// Protected routes
router.post('/partner', setPartner as RequestHandler);
router.get('/partner', getPartner as RequestHandler);
router.delete('/partner', removePartner as RequestHandler);
router.get('/search', searchUserByEmail as RequestHandler);

// Partner request routes
router.post('/partner-requests', createPartnerRequest as RequestHandler);
router.get('/partner-requests', getPartnerRequests as RequestHandler);
router.get('/partner-requests/pending', getPendingPartnerRequests as RequestHandler);
router.post('/partner-requests/respond', respondToPartnerRequest as RequestHandler);

export default router;