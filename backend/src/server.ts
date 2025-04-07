import express from 'express';
import cors from 'cors';
import investRoutes from './routes/invest';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/invest', investRoutes); // ✅ Register the route

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
