import express from 'express';
import { getItems } from './controller.js';

const router = express.Router();

// Define your endpoints here
router.get('/api/items', getItems);

export { router };
