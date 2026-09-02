// ── Standalone Safe Test Data Purge Script ─────────────────────────────────────
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

async function purge() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/careerflux';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Identify obvious test user patterns
    const testUserQuery = {
        $or: [
            { email: { $regex: /^(emp1_|seeker|test|dummy|demo|employerone)/i } },
            { firstName: { $regex: /^(Seeker User|EmployerOne|Test User|Demo User)/i } },
            { companyName: { $regex: /^Company One/i } }
        ]
    };

    const testUsers = await User.find(testUserQuery);
    console.log(`🔍 Found ${testUsers.length} test users matching criteria.`);

    if (testUsers.length > 0) {
        const testUserIds = testUsers.map(u => u._id);
        const deletedUsers = await User.deleteMany({ _id: { $in: testUserIds } });
        console.log(`🗑  Deleted ${deletedUsers.deletedCount} test user accounts.`);

        // Delete jobs posted by test users
        const deletedJobs = await Job.deleteMany({ postedBy: { $in: testUserIds } });
        console.log(`🗑  Deleted ${deletedJobs.deletedCount} associated test jobs.`);
    }

    // Delete jobs titled 'Full Stack Engineer at Company One' or similar dummy jobs
    const dummyJobs = await Job.deleteMany({ company: { $regex: /^Company One/i } });
    console.log(`🗑  Deleted ${dummyJobs.deletedCount} dummy company job listings.`);

    // Clean up applications referencing non-existent jobs or users
    const validJobIds = (await Job.find().select('_id')).map(j => j._id);
    const validUserIds = (await User.find().select('_id')).map(u => u._id);

    const orphanedApps = await Application.deleteMany({
        $or: [
            { job: { $nin: validJobIds } },
            { applicant: { $nin: validUserIds } }
        ]
    });
    console.log(`🧹 Cleaned up ${orphanedApps.deletedCount} orphaned applications.`);

    console.log('\n✨ Purge complete!');
    await mongoose.disconnect();
    process.exit(0);
}

purge().catch(err => {
    console.error('❌ Purge failed:', err.message);
    process.exit(1);
});
