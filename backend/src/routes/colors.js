const router = require('express').Router();
const Color = require('../models/Color');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', async (_req, res) => {
  try {
    let colors = await Color.find().sort({ category: 1, name: 1 });
    if (!colors.length) {
      const defaults = [
        ['Ocean Breeze', '#78B7C5', 'Cool'], ['Soft Sage', '#A8B8A0', 'Earthy'],
        ['Warm Linen', '#E9DDC7', 'Neutral'], ['Terracotta', '#C87556', 'Bold'],
        ['Lavender Mist', '#C6B6D9', 'Pastel'], ['Midnight Blue', '#273B59', 'Luxury'],
        ['Buttercream', '#F2D58A', 'Warm'], ['Cloud White', '#F7F5F0', 'Neutral']
      ].map(([name, hex, category]) => ({ name, hex, category, finish: 'Matte', brand: 'Studio Palette' }));
      await Color.insertMany(defaults);
      colors = await Color.find().sort({ category: 1, name: 1 });
    }
    res.json(colors);
  } catch (_err) { res.status(500).json({ message: 'Could not load colours.' }); }
});
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try { res.status(201).json(await Color.create(req.body)); }
  catch (_err) { res.status(400).json({ message: 'Invalid colour. Use a name and HEX value such as #AABBCC.' }); }
});
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const color = await Color.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!color) return res.status(404).json({ message: 'Colour not found.' });
    res.json(color);
  } catch (_err) { res.status(400).json({ message: 'Could not update colour.' }); }
});
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const color = await Color.findByIdAndDelete(req.params.id);
  if (!color) return res.status(404).json({ message: 'Colour not found.' });
  res.json({ message: 'Colour deleted.' });
});
module.exports = router;
