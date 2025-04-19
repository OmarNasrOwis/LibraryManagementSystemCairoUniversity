import express from 'express';
import bookRoutes from './routes/bookRoutes.js';
import pool from './config/db.js';

const app = express();
app.use(express.json()); 

// Routes
app.use('/api/books', bookRoutes);

// Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
