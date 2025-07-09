const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes (require authentication only)
router.get('/my', protect, taskController.getAllTasks);
router.get('/upcoming', protect, taskController.getUpcomingTasks); // Add this route before /:id
router.post('/', protect, taskController.createTask);
router.get('/projects', protect, authorize('admin'), taskController.getProjectStats); // New route for project stats
router.get('/:id', protect, taskController.getTaskById); // Fixed method name
router.put('/:id', protect, taskController.updateTask);
router.delete('/:id', protect, taskController.deleteTask);

// Admin only routes
router.get('/all/tasks', protect, authorize('admin'), taskController.getAllTasksAdmin);

module.exports = router;
