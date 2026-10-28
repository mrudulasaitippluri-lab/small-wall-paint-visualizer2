const router = require('express').Router();
const Project = require('../models/Project');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { user: req.user._id };
    res.json(await Project.find(filter).populate('user', 'name email').sort({ updatedAt: -1 }).limit(100));
  } catch (_err) { res.status(500).json({ message: 'Could not load projects.' }); }
});
router.post('/', async (req, res) => {
  try {
    const { title, originalImage, previewImage, polygon, color, opacity } = req.body;
    if (!originalImage || !previewImage) return res.status(400).json({ message: 'Image data is required.' });
    if (originalImage.length > 8_000_000 || previewImage.length > 8_000_000)
      return res.status(413).json({ message: 'Image is too large for demo storage. Try a smaller image.' });
    const project = await Project.create({ user: req.user._id, title, originalImage, previewImage, polygon: polygon || [], color: color || {}, opacity });
    res.status(201).json(project);
  } catch (_err) { res.status(400).json({ message: 'Could not save project.' }); }
});
router.get('/:id', async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, ...(req.user.role === 'admin' ? {} : { user: req.user._id }) });
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  res.json(project);
});
router.delete('/:id', async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, ...(req.user.role === 'admin' ? {} : { user: req.user._id }) });
  if (!project) return res.status(404).json({ message: 'Project not found.' });
  res.json({ message: 'Project deleted.' });
});
module.exports = router;
