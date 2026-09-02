// ── Safe & Strictly-Scoped Test Data Purge Script ──────────────────────────────
// Usage:
//   node purgeTestData.js           -> DRY RUN (shows what would be deleted)
//   node purgeTestData.js --confirm -> EXECUTE DELETION (requires explicit flag)

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const IS_EXECUTE_MODE = process.argv.includes('--confirm');

async function safePurge() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/careerflux';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    if (!IS_EXECUTE_MODE) {
        console.log('\n🔍 [DRY-RUN MODE] No data will be deleted. Pass --confirm to execute.\n');
    } else {
        console.log('\n⚠️  [EXECUTE MODE] Executing safe deletion...\n');
    }

    // STRICT TEST USER QUERY: Exact test prefixes/emails only (NO loose /^seeker/i regex!)
    const testUserQuery = {
        $or: [
            { email: { $regex: /^(emp1_[0-9]+@|employerone@|seekeruser@|testuser_fixture@)/i } },
            { firstName: { $in: ['EmployerOne User', 'Seeker User Fixture', 'Demo Fixture User'] } },
            { companyName: 'Company One Test Fixture' }
        ]
    };

    const testUsers = await User.find(testUserQuery).select('_id email firstName companyName');
    console.log(`📋 Found ${testUsers.length} test fixture users matching strict query:`);
    testUsers.forEach(u => console.log(`   - ${u.email} (${u.firstName || u.companyName || 'No Name'})`));

    const testUserIds = testUsers.map(u => u._id);

    // STRICT TEST JOBS QUERY: Only jobs posted by test fixture users OR explicitly named 'Company One'
    const testJobQuery = {
        $or: [
            { postedBy: { $in: testUserIds } },
            { company: 'Company One' },
            { company: 'Company One Test Fixture' }
        ]
    };

    const testJobs = await Job.find(testJobQuery).select('_id title company');
    console.log(`\n📋 Found ${testJobs.length} test fixture jobs matching strict query:`);
    testJobs.forEach(j => console.log(`   - "${j.title}" at ${j.company}`));

    const testJobIds = testJobs.map(j => j._id);

    if (IS_EXECUTE_MODE) {
        if (testUserIds.length > 0) {
            const delUsers = await User.deleteMany({ _id: { $in: testUserIds } });
            console.log(`\n🗑  Deleted ${delUsers.deletedCount} test fixture users.`);
        }

        if (testJobIds.length > 0) {
            const delJobs = await Job.deleteMany({ _id: { $in: testJobIds } });
            console.log(`🗑  Deleted ${delJobs.deletedCount} test fixture jobs.`);
        }

        // Safe orphan cleanup: Only delete applications specifically pointing to deleted test jobs/users
        if (testJobIds.length > 0 || testUserIds.length > 0) {
            const delApps = await Application.deleteMany({
                $or: [
                    { job: { $in: testJobIds } },
                    { applicant: { $in: testUserIds } }
                ]
            });
            console.log(`🧹 Cleaned up ${delApps.deletedCount} applications linked to test fixtures.`);
        }

        console.log('\n✨ Safe purge complete!');
    } else {
        console.log('\n💡 Dry-run complete. Re-run with `node purgeTestData.js --confirm` to apply changes.');
    }

    await mongoose.disconnect();
    process.exit(0);
}

safePurge().catch(err => {
    console.error('❌ Purge error:', err.message);
    process.exit(1);
});
