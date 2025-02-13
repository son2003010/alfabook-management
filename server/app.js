import express from 'express';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import userRoutes from './src/routes/userRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import bookRoutes from './src/routes/bookRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import publisherRoutes from './src/routes/publisherRoutes.js';
import authorRoutes from './src/routes/authorRoutes.js';
import promotionRoutes from './src/routes/promotionRoutes.js';
import salesRoutes from './src/routes/salesRoutes.js';

import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();

connectDB();

app.use(express.json());
app.use(cors());
app.set('trust proxy', 1)

app.use('/api', userRoutes);
app.use('/api', categoryRoutes)
app.use('/api', bookRoutes)
app.use('/api', cartRoutes)
app.use('/api', orderRoutes)
app.use('/api', publisherRoutes);
app.use('/api', authorRoutes);
app.use('/api', promotionRoutes);
app.use('/api', salesRoutes);

app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});