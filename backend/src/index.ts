import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database.js';
import { initCronTasks } from './services/cronService.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/item.js';
import './models/index.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

const PORT = 3000;

async function startServer() {
  let connected = false;
  let retries = 10;

  while (!connected && retries > 0) {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      
      console.log('[OK] Database connected and synced');
      connected = true;

      initCronTasks();

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://0.0.0.0:${PORT}`);
      });
      
    } catch (err: any) {
      retries -= 1;
      console.error(`[X] Connection failed. Retries left: ${retries}`);
      console.error(`Reason: ${err.message}`);

      await new Promise(res => setTimeout(res, 5000));
    }
  }

  if (!connected) {
    console.error('Could not connect to the database. Exiting...');
    process.exit(1);
  }
}

startServer();
