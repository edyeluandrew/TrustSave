import express from 'express';
import {
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest
} from '../controllers/joinRequestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/groups/:groupId/join-requests', getJoinRequests);
router.post('/:requestId/approve', approveJoinRequest);
router.post('/:requestId/reject', rejectJoinRequest);

export default router;