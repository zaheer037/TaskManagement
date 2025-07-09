const express = require('express');
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getUpcomingTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Route order matters! Place specific routes before parametric routes
router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/upcoming', getUpcomingTasks); // Moved before /:id
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
