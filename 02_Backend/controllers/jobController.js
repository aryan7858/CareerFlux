const Job = require('../models/Job');
const { sendSuccess, sendError } = require('../utils/response');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.createJob = async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            postedBy: req.user._id,
            company: req.user.companyName || req.body.company,
        };

        const job = await Job.create(jobData);

        return sendSuccess(res, { job }, 'Job posted successfully.', 201);
    } catch (err) {
        console.error('CreateJob error:', err);
        return sendError(res, 'Failed to create job posting.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all jobs (public, with search/filter/pagination)
// @route   GET /api/jobs
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const axios = require('axios');

exports.getJobs = async (req, res) => {
    try {
        const {
            search,
            category,
            type,
            location,
            experienceLevel,
            industry,
            experienceRecommend,
            skillsMatch,
            page = 1,
            limit = 12,
            sort = '-createdAt',
        } = req.query;

        const query = { isActive: true };

        // Optional authentication token resolution for personalized recommend filters
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        let user = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this');
                user = await User.findById(decoded.id);
            } catch (e) {
                // Non-fatal jwt parsing error
            }
        }

        // Text search across title, description, company
        if (search) {
            query.$text = { $search: search };
        }

        if (category) query.category = category;
        if (type) query.type = type;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (experienceLevel) query.experienceLevel = experienceLevel;

        // 1. Industry-specific filter
        if (industry) {
            const employers = await User.find({ role: 'employer', industry: { $regex: industry, $options: 'i' } }).select('_id');
            const employerIds = employers.map(e => e._id);
            query.postedBy = { $in: employerIds };
        }

        // 2. Experience-based recommendations (map seeker experience length to job experienceLevels)
        if (experienceRecommend === 'true' && user) {
            const userExpCount = user.experience?.length || 0;
            let allowedLevels = ['entry', 'mid'];
            if (userExpCount >= 5) {
                allowedLevels = ['senior', 'lead', 'executive'];
            } else if (userExpCount >= 2) {
                allowedLevels = ['mid', 'senior'];
            }
            query.experienceLevel = { $in: allowedLevels };
        }

        // 3. Skill-based matching filter
        if (skillsMatch === 'true' && user && user.skills?.length > 0) {
            const userSkillsRegex = user.skills.map(skill => new RegExp(`^${skill}$`, 'i'));
            query.skills = { $in: userSkillsRegex };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // 1. Fetch from Local Database
        const dbTotal = await Job.countDocuments(query);
        let jobs = await Job.find(query)
            .populate('postedBy', 'firstName lastName companyName companyLogoUrl')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        let total = dbTotal;

        // 2. Fetch from Findwork API (if key is provided)
        if (process.env.FINDWORK_API_KEY && parseInt(page) === 1) { // Fetch external primarily on page 1
            try {
                const findworkOptions = {
                    method: 'GET',
                    url: 'https://findwork.dev/api/jobs/',
                    params: {
                        search: [search, category].filter(Boolean).join(' ') || undefined,
                        location: location || undefined
                    },
                    headers: {
                        'Authorization': `Token ${process.env.FINDWORK_API_KEY}`
                    }
                };

                const extRes = await axios.request(findworkOptions);
                
                if (extRes.data && extRes.data.results) {
                    const externalJobs = extRes.data.results.map(job => {
                        // Map Findwork employment type to our internal types
                        let mappedType = 'full-time';
                        if (job.employment_type) {
                            const empType = job.employment_type.toLowerCase();
                            if (empType.includes('part')) mappedType = 'part-time';
                            else if (empType.includes('contract')) mappedType = 'contract';
                            else if (empType.includes('intern')) mappedType = 'internship';
                        }
                        if (job.remote) mappedType = 'remote';

                        return {
                            _id: `ext_${job.id}`,
                            title: job.role,
                            company: job.company_name,
                            description: job.text || '',
                            location: job.location || (job.remote ? 'Remote' : 'Anywhere'),
                            type: mappedType,
                            category: category || 'Technology', // Default or inherit
                            experienceLevel: experienceLevel || 'mid',
                            skills: job.keywords || [],
                            salary: {
                                min: null,
                                max: null,
                                currency: 'USD'
                            },
                            isActive: true,
                            createdAt: job.date_posted || new Date().toISOString(),
                            postedBy: {
                                companyLogoUrl: job.logo,
                                companyName: job.company_name,
                            },
                            isExternal: true, // Flag to identify external jobs
                            externalApplyUrl: job.url
                        };
                    });

                    // Append external jobs to local jobs (max 10 external + local)
                    jobs = [...jobs, ...externalJobs].slice(0, Math.max(parseInt(limit), jobs.length + externalJobs.length));
                    total += externalJobs.length; 
                }
            } catch (externalErr) {
                console.error('Findwork API fetching error:', externalErr.response?.data || externalErr.message);
                // Non-fatal error, continue returning local jobs
            }
        }

        return sendSuccess(res, {
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit),
            },
        });
    } catch (err) {
        console.error('GetJobs error:', err);
        return sendError(res, 'Failed to fetch jobs.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'firstName lastName companyName companyLogoUrl companyWebsite companyDescription industry');

        if (!job) {
            return sendError(res, 'Job not found.', 404);
        }

        return sendSuccess(res, { job });
    } catch (err) {
        console.error('GetJobById error:', err);
        return sendError(res, 'Failed to fetch job.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update own job posting
// @route   PUT /api/jobs/:id
// @access  Private (Employer - owner only)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return sendError(res, 'Job not found.', 404);
        }

        // Prevent changing postedBy
        delete req.body.postedBy;

        job = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        return sendSuccess(res, { job }, 'Job updated successfully.');
    } catch (err) {
        console.error('UpdateJob error:', err);
        return sendError(res, 'Failed to update job.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete own job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Employer - owner only)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return sendError(res, 'Job not found.', 404);
        }

        await Job.findByIdAndDelete(req.params.id);

        return sendSuccess(res, {}, 'Job deleted successfully.');
    } catch (err) {
        console.error('DeleteJob error:', err);
        return sendError(res, 'Failed to delete job.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get employer's own posted jobs
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.getEmployerJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {}; // Allow any employer to see all jobs so they can access/modify them
        const total = await Job.countDocuments(query);

        const jobs = await Job.find(query)
            .populate('postedBy', 'firstName lastName email companyName')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        return sendSuccess(res, {
            jobs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('GetEmployerJobs error:', err);
        return sendError(res, 'Failed to fetch your jobs.', 500);
    }
};
