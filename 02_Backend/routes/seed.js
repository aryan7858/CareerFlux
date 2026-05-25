const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');

const DEFAULT_PASSWORD = 'Password123';

// POST /api/seed  — only works in development mode
router.post('/', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: 'Seeding only allowed in development' });
    }

    try {
        // ── Clear ──────────────────────────────────────────────────────────
        await Promise.all([User.deleteMany({}), Job.deleteMany({})]);

        // ── Admin ──────────────────────────────────────────────────────────
        await User.create({
            firstName: 'Admin', lastName: 'CareerFlux',
            email: 'admin@careerflux.io',
            password: DEFAULT_PASSWORD,
            role: 'admin', isEmailVerified: true,
        });

        // ── Employers ──────────────────────────────────────────────────────
        res.json({
            message: '✅ Database seeded successfully!',
            counts: {
                users: 1,
                jobs: 0,
            },
            credentials: {
                password: DEFAULT_PASSWORD,
                admin: 'admin@careerflux.io',
            },
        });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
