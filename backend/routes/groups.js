import express from 'express';
import { 
  createGroup, 
  getGroups, 
  getGroup, 
  updateGroup, 
  deleteGroup,
  addMember,
  removeMember
} from '../controllers/groupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(createGroup)
  .get(getGroups);

router.route('/:id')
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

router.route('/:id/members')
  .post(addMember)
  .delete(removeMember);

export default router;