require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/database');
const { seed, seedVideos, seedJobs } = require('./db/seed');
const { seedLessonsV2 } = require('./db/seedLessonsV2');
const { seedProblems } = require('./db/seedProblems');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

(async () => {
  const database = await initDb();
  seed(database);
  seedVideos(database);
  seedJobs(database);
  seedLessonsV2(database);
  seedProblems(database);
  app.locals.db = database;

  app.use('/api/auth',     require('./routes/auth'));
  app.use('/api/courses',  require('./routes/courses'));
  app.use('/api/problems', require('./routes/problems'));
  app.use('/api/quiz',     require('./routes/quiz'));
  app.use('/api/users',    require('./routes/users'));
  app.use('/api/admin',    require('./routes/admin'));
  app.use('/api/premium', require('./routes/premium'));
  app.use('/api/jobs',    require('./routes/jobs'));

  app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

  app.listen(PORT, () => console.log(`🚀 DataLift API → http://localhost:${PORT}`));
})();
