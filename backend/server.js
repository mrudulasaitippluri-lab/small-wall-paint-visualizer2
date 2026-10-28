require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth');
const colorRoutes = require('./src/routes/colors');
const projectRoutes = require('./src/routes/projects');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.use(express.json({ limit: '12mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Smart Wall Paint Visualizer API' }));
app.use('/api/auth', authRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/projects', projectRoutes);

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_wall_paint_visualizer')
  .then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
