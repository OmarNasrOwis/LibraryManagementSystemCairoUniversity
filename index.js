import express from 'express';
import bookRoutes from './routes/bookRoutes.js';
import login from './routes/loginRouter.js'
import dotenv from 'dotenv';
const app = express();
app.use(express.json()); 

dotenv.config();

// Routes
app.use('/api/books', bookRoutes);
app.use('/', login);
// Server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
