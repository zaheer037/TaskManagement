const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { status, category, project, sortBy } = req.query;
    const isAdmin = req.user.role === 'admin';

    // Base query depending on user role
    let query = isAdmin ? {} : { createdBy: req.user._id };

    // Apply filters
    if (status && status !== 'all') query.status = status;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (project) query.project = { $regex: project, $options: 'i' };

    // Set up sorting
    let sortOption = {};
    if (sortBy === 'deadline') {
      sortOption.deadline = 1;
    } else {
      sortOption.createdAt = -1; // Default sort by creation date
    }

    const tasks = await Task.find(query)
      .sort(sortOption)
      .populate('assignedTo', 'name email');

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    let query = { _id: req.params.id };
    
    // If not admin, can only view tasks they created or are assigned to
    if (!isAdmin) {
      query.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    const task = await Task.findOne(query).populate('assignedTo', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUpcomingTasks = async (req, res) => {
  try {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ],
      deadline: { $exists: true }, // Only tasks with deadline set
      status: { $ne: 'completed' },
      $or: [
        { deadline: { $lte: in48Hours } }, // Due within 48 hours
        { deadline: { $lt: now } } // Overdue tasks
      ]
    })
    .sort({ deadline: 1 }) // Sort by nearest deadline first
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

    if (!tasks) {
      return res.status(404).json({ message: 'No tasks found' });
    }

    // Filter out tasks with invalid deadlines and format them
    const validTasks = tasks.filter(task => task.deadline && !isNaN(new Date(task.deadline).getTime()));

    res.json({ tasks: validTasks });
  } catch (err) {
    console.error('Error in getUpcomingTasks:', err);
    res.status(500).json({ 
      message: 'Error fetching upcoming tasks',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

