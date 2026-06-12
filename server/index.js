
import express from 'express';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Main App Home Page Route
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Autonomous Affiliate Engine</h1><p>Your subscription engine is officially live and running!</p>');
});

// Route to register a new user
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const result = await db.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, password]
        );
        
        res.status(201).json({
            message: 'User registered successfully!',
            user: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'This email is already registered.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Route to check subscription status
app.get('/api/subscription/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            'SELECT * FROM subscriptions WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ status: 'inactive', message: 'No active subscription found.' });
        }

        res.json({ subscription: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});
