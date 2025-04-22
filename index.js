import express from 'express';
import bookRoutes from './routes/bookRoutes.js';
import login from './routes/loginRouter.js'
import register from './routes/addUserRoutes.js'
import dotenv from 'dotenv';
const app = express();
app.use(express.json()); 

dotenv.config();

// Routes
app.use('/api/books', bookRoutes);
app.use('/users', login);
app.use('/users', register);

app.get('/', (req, res) => {
  res.send('Welcome to backend of Library Management System App.');
});
// Server
const port = process.env.PORT || 3001;
app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on port 3000');
});
