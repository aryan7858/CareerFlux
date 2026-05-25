// ── DNS fix for Windows / MongoDB Atlas SRV ──────────────────────────────────
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// ── Models ────────────────────────────────────────────────────────────────────
const User = require('./models/User');
const Job = require('./models/Job');

// ── Connect ────────────────────────────────────────────────────────────────────
async function connect() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/careerflux';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
}

// ── Plain-text password (will be hashed by the User pre-save hook) ────────────
const DEFAULT_PASSWORD = 'Password123';

// ── Seed data ─────────────────────────────────────────────────────────────────

const adminUser = {
    firstName: 'Admin', lastName: 'CareerFlux',
    email: 'admin@careerflux.io',
    password: DEFAULT_PASSWORD,
    role: 'admin',
    isEmailVerified: true,
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
    await connect();

    // Clear existing data
    console.log('🗑  Clearing existing data...');
    await Promise.all([User.deleteMany({}), Job.deleteMany({})]);

    // Create admin
    console.log('👤 Creating admin...');
    await User.create(adminUser);

    console.log('\n✅ Seed complete!');
    console.log(`   Users created : 1`);
    console.log(`   Jobs created  : 0`);
    console.log('\n🔑 Login credentials (password: Password123):');
    console.log('   Admin    → admin@careerflux.io');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
