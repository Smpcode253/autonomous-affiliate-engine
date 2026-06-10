import express from 'express';
import { router } from './routes.js';

const app = express();
// Railway automatically provides a PORT environment variable. Fallback to 8080 for safety.
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Main router
app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server is running natively on port ${PORT}`);
});
