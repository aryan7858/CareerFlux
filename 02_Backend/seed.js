// ── DNS fix for Windows / MongoDB Atlas SRV ──────────────────────────────────
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');

// Prevent running in production
if (process.env.NODE_ENV === 'production') {
    console.error('⛔ Refusing to run seed script in production environment!');
    process.exit(1);
}

// ── Models ────────────────────────────────────────────────────────────────────
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

// ── Connect ────────────────────────────────────────────────────────────────────
async function connect() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/careerflux';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
}

const DEFAULT_PASSWORD = 'Password123';

const adminUser = {
    firstName: 'Admin', lastName: 'CareerFlux',
    email: 'admin@careerflux.io',
    password: DEFAULT_PASSWORD,
    role: 'admin',
    isEmailVerified: true,
    isVerified: true,
};

const employerUsers = [
    {
        firstName: 'Sarah', lastName: 'Chen',
        email: 'sarah@stripe.com',
        password: DEFAULT_PASSWORD,
        role: 'employer',
        companyName: 'Stripe',
        companyWebsite: 'https://stripe.com',
        companySize: '1000+',
        industry: 'Fintech / Payments',
        companyDescription: 'Stripe is a financial infrastructure platform for businesses. Millions of companies use Stripe to accept payments and grow revenue.',
        isActive: true,
        isVerified: true,
        verificationStatus: 'verified',
    },
    {
        firstName: 'Marcus', lastName: 'Vance',
        email: 'marcus@vercel.com',
        password: DEFAULT_PASSWORD,
        role: 'employer',
        companyName: 'Vercel',
        companyWebsite: 'https://vercel.com',
        companySize: '201-500',
        industry: 'Cloud Platform & Infrastructure',
        companyDescription: 'Vercel is the developer platform for frontend teams, providing the speed and reliability developers need to create at the edge.',
        isActive: true,
        isVerified: true,
        verificationStatus: 'verified',
    },
    {
        firstName: 'Elena', lastName: 'Rostova',
        email: 'elena@datadog.com',
        password: DEFAULT_PASSWORD,
        role: 'employer',
        companyName: 'Datadog',
        companyWebsite: 'https://datadoghq.com',
        companySize: '501-1000',
        industry: 'Observability & Security',
        companyDescription: 'Datadog is an essential monitoring and security platform for cloud applications.',
        isActive: true,
        isVerified: true,
        verificationStatus: 'verified',
    }
];

const sampleJobsData = [
    {
        title: 'Senior Full Stack Engineer',
        company: 'Stripe',
        location: 'San Francisco, CA (Hybrid)',
        salary: { min: 160000, max: 210000, currency: 'USD' },
        type: 'full-time',
        category: 'Programming & Code',
        experienceLevel: 'senior',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design', 'Docker'],
        requirements: [
            '5+ years building scalable web applications with React and Node.js.',
            'Strong background in designing distributed systems and RESTful APIs.',
            'Experience working with financial infrastructure or high-throughput payment gateways.'
        ],
        description: 'Join Stripe\'s core infrastructure team to build next-generation payment APIs. You will own end-to-end features, from backend distributed ledger microservices to intuitive merchant analytics dashboards.',
    },
    {
        title: 'Lead Frontend Infrastructure Engineer',
        company: 'Vercel',
        location: 'Remote (US/EU)',
        salary: { min: 175000, max: 230000, currency: 'USD' },
        type: 'remote',
        category: 'Programming & Code',
        experienceLevel: 'lead',
        skills: ['Next.js', 'React', 'TypeScript', 'Web Performance', 'TailwindCSS', 'GraphQL'],
        requirements: [
            'Proven track record of optimizing high-traffic frontend applications.',
            'Deep expertise with Next.js App Router, SSR, Edge Middleware, and Turbopack.',
            'Active contributor to open-source developer tooling is a plus.'
        ],
        description: 'Vercel is seeking a Lead Frontend Engineer to drive developer experience innovations. You will optimize runtime performance across edge networks and lead technical initiatives powering millions of web applications.',
    },
    {
        title: 'Product Marketing Manager',
        company: 'Stripe',
        location: 'New York, NY',
        salary: { min: 130000, max: 165000, currency: 'USD' },
        type: 'full-time',
        category: 'Marketing & Sales',
        experienceLevel: 'mid',
        skills: ['Product Strategy', 'GTM Planning', 'Copywriting', 'SEO', 'Data Analytics', 'HubSpot'],
        requirements: [
            '3+ years of B2B SaaS product marketing experience.',
            'Demonstrated capability to craft compelling developer-facing narratives and product messaging.',
            'Data-driven mindset with experience analyzing product adoption metrics.'
        ],
        description: 'Drive go-to-market execution for Stripe billing products. You will work closely with product managers and sales teams to launch new platform features and create high-converting collateral.',
    },
    {
        title: 'Staff Cloud Systems & Observability Architect',
        company: 'Datadog',
        location: 'Boston, MA (Hybrid)',
        salary: { min: 190000, max: 250000, currency: 'USD' },
        type: 'full-time',
        category: 'Design & Development',
        experienceLevel: 'lead',
        skills: ['Kubernetes', 'Go', 'AWS', 'Distributed Systems', 'Linux', 'Terraform'],
        requirements: [
            '7+ years in Site Reliability Engineering or Systems Architecture.',
            'Deep operational expertise with Kubernetes clusters handling tens of thousands of requests per second.',
            'Proficiency in Go or Rust for systems programming.'
        ],
        description: 'Datadog is looking for a Staff Architect to scale our real-time telemetry pipelines. You will lead architectural reviews, mentor senior engineers, and design resilient multi-region infrastructure.',
    },
    {
        title: 'Senior UX Designer & Design System Lead',
        company: 'Vercel',
        location: 'Remote',
        salary: { min: 140000, max: 185000, currency: 'USD' },
        type: 'remote',
        category: 'Design & Development',
        experienceLevel: 'senior',
        skills: ['Figma', 'Design Systems', 'UI/UX Design', 'User Research', 'CSS/HTML', 'Prototyping'],
        requirements: [
            '4+ years building design systems for enterprise SaaS or developer tools.',
            'Flawless aesthetic sense with pixel-perfect attention to detail and typography.',
            'Strong ability to conduct user interviews and turn complex developer workflows into simple interfaces.'
        ],
        description: 'Shape the visual language of Vercel. As Design System Lead, you will build and maintain component libraries used across all product suites, ensuring accessibility, dark mode compliance, and pristine craft.',
    },
    {
        title: 'Backend Software Engineer - Data Engineering',
        company: 'Datadog',
        location: 'Austin, TX',
        salary: { min: 135000, max: 170000, currency: 'USD' },
        type: 'full-time',
        category: 'Programming & Code',
        experienceLevel: 'mid',
        skills: ['Python', 'Spark', 'Kafka', 'SQL', 'Snowflake', 'Docker'],
        requirements: [
            '3+ years building data pipelines and ETL workflows.',
            'Solid experience with Apache Kafka, Spark, and columnar data stores.',
            'Strong SQL skills and commitment to data governance.'
        ],
        description: 'Join the Data Engineering group at Datadog. You will engineer low-latency ingestion pipelines processing petabytes of log streams daily.',
    }
];

async function seed() {
    await connect();

    console.log('🗑  Clearing existing data...');
    await Promise.all([User.deleteMany({}), Job.deleteMany({}), Application.deleteMany({})]);

    console.log('👤 Creating admin...');
    await User.create(adminUser);

    console.log('🏢 Creating verified employers...');
    const createdEmployers = await User.create(employerUsers);

    console.log('💼 Creating realistic job postings...');
    const jobsToCreate = sampleJobsData.map((job, idx) => {
        const emp = createdEmployers[idx % createdEmployers.length];
        return {
            ...job,
            postedBy: emp._id,
            isActive: true,
        };
    });

    await Job.create(jobsToCreate);

    console.log('\n✅ Realistic seed complete!');
    console.log(`   Users created : 4 (1 Admin, 3 Employers)`);
    console.log(`   Jobs created  : ${sampleJobsData.length}`);
    console.log('\n🔑 Login credentials (password: Password123):');
    console.log('   Admin    → admin@careerflux.io');
    console.log('   Stripe   → sarah@stripe.com');
    console.log('   Vercel   → marcus@vercel.com');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
