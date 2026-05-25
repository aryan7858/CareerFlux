const Application = require('../models/Application');
const Job = require('../models/Job');
const { sendSuccess, sendError } = require('../utils/response');
const { sendNotification } = require('../utils/notificationService');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Jobseeker)
// ─────────────────────────────────────────────────────────────────────────────
exports.applyForJob = async (req, res) => {
    try {
        let { jobId, coverLetter, resumeId } = req.body;

        // Verify job exists and is active
        const job = await Job.findById(jobId);
        if (!job || !job.isActive) {
            return sendError(res, 'Job not found or no longer active.', 404);
        }

        // Check deadline
        if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
            return sendError(res, 'Application deadline has passed.', 400);
        }

        // Check for existing application
        const existing = await Application.findOne({
            job: jobId,
            applicant: req.user._id,
        });
        if (existing) {
            return sendError(res, 'You have already applied for this job.', 409);
        }

        // If resumeId is not provided by frontend, try to fetch the jobseeker's uploaded resume
        if (!resumeId) {
            const Resume = require('../models/Resume');
            const userResume = await Resume.findOne({ user: req.user._id });
            if (userResume) {
                resumeId = userResume._id;
            }
        }

        const application = await Application.create({
            job: jobId,
            applicant: req.user._id,
            resume: resumeId || undefined,
            coverLetter,
        });

        // Increment application count on the job
        await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

        // Trigger real-time notification to the employer
        await sendNotification({
            recipient: job.postedBy,
            sender: req.user._id,
            type: 'application_submitted',
            title: 'New Job Application',
            message: `${req.user.firstName} ${req.user.lastName || ''} applied for "${job.title}".`,
            link: `/employer/jobs/${jobId}/applicants`,
        });

        return sendSuccess(res, { application }, 'Application submitted successfully.', 201);
    } catch (err) {
        console.error('ApplyForJob error:', err);
        return sendError(res, 'Failed to submit application.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get my applications (jobseeker)
// @route   GET /api/applications/my
// @access  Private (Jobseeker)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyApplications = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { applicant: req.user._id };
        if (status) query.status = status;

        const total = await Application.countDocuments(query);

        const applications = await Application.find(query)
            .populate({
                path: 'job',
                select: 'title company location type salary isActive',
                populate: { path: 'postedBy', select: 'companyName companyLogoUrl' },
            })
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit));

        return sendSuccess(res, {
            applications,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('GetMyApplications error:', err);
        return sendError(res, 'Failed to fetch applications.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get applications for a specific job (employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.getJobApplications = async (req, res) => {
    try {
        // Ensure employer owns this job
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return sendError(res, 'Job not found.', 404);
        }

        const { page = 1, limit = 20, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { job: req.params.jobId };
        if (status) query.status = status;

        const total = await Application.countDocuments(query);

        let applications = await Application.find(query)
            .populate('applicant', 'firstName lastName email headline skills location resumeUrl')
            .populate('resume', 'filename originalName')
            .populate('assignedTo', 'firstName lastName email companyName')
            .sort('-createdAt')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Fallback: Attach uploaded resumes to existing applications that were missing them
        const Resume = require('../models/Resume');
        applications = await Promise.all(applications.map(async (app) => {
            if (!app.resume && app.applicant) {
                const userResume = await Resume.findOne({ user: app.applicant._id }).select('filename originalName').lean();
                if (userResume) {
                    app.resume = userResume;
                    // Update the database to fix the missing relation for future queries
                    await Application.findByIdAndUpdate(app._id, { resume: userResume._id });
                }
            }
            return app;
        }));

        return sendSuccess(res, {
            applications,
            job: { title: job.title, company: job.company },
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('GetJobApplications error:', err);
        return sendError(res, 'Failed to fetch applications.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update application status (employer)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, employerNotes } = req.body;

        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return sendError(res, 'Application not found.', 404);
        }

        application.status = status || application.status;
        if (employerNotes !== undefined) application.employerNotes = employerNotes;
        await application.save();

        // Trigger real-time notification to the applicant
        await sendNotification({
            recipient: application.applicant,
            sender: req.user._id,
            type: 'status_updated',
            title: 'Application Status Updated',
            message: `Your application for "${application.job.title}" has been updated to "${status}".`,
            link: '/dashboard',
        });

        return sendSuccess(res, { application }, 'Application status updated.');
    } catch (err) {
        console.error('UpdateApplicationStatus error:', err);
        return sendError(res, 'Failed to update application.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reply to an application (employer or jobseeker)
// @route   PUT /api/applications/:id/reply
// @access  Private (Employer, Jobseeker)
// ─────────────────────────────────────────────────────────────────────────────
exports.replyToApplication = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return sendError(res, 'Message cannot be empty.', 400);
        }

        const application = await Application.findById(req.params.id).populate('job');

        if (!application) {
            return sendError(res, 'Application not found.', 404);
        }

        if (req.user.role === 'employer') {
            // All employers are allowed to reply to applications
        } else if (req.user.role === 'jobseeker' || req.user.role === 'seeker') {
            // Verify jobseeker owns the application
            if (application.applicant.toString() !== req.user._id.toString()) {
                return sendError(res, 'Not authorized to reply to this application.', 403);
            }
        } else {
            return sendError(res, 'Role not authorized.', 403);
        }

        const roleToSave = (req.user.role === 'seeker') ? 'jobseeker' : req.user.role;

        application.replies.push({
            senderRole: roleToSave,
            message: message.trim(),
        });
        
        await application.save();

        // Determine recipient of the notification
        const recipient = req.user.role === 'employer'
            ? application.applicant
            : (application.assignedTo || application.job.postedBy);

        // Determine redirection link
        const notificationLink = req.user.role === 'employer'
            ? '/dashboard'
            : `/employer/jobs/${application.job._id}/applicants`;

        // Trigger real-time notification
        await sendNotification({
            recipient,
            sender: req.user._id,
            type: 'reply_received',
            title: 'New Message',
            message: `${req.user.firstName} ${req.user.lastName || ''} sent a new message regarding "${application.job.title}".`,
            link: notificationLink,
        });

        return sendSuccess(res, { application }, 'Reply sent successfully.');
    } catch (err) {
        console.error('ReplyToApplication error:', err);
        return sendError(res, 'Failed to send reply.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get active employers to transfer to
// @route   GET /api/applications/employers
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.getEmployers = async (req, res) => {
    try {
        const User = require('../models/User');
        const employers = await User.find({ role: 'employer', isActive: true })
            .select('firstName lastName email companyName')
            .sort('firstName');
        return sendSuccess(res, { employers }, 'Employers fetched successfully.');
    } catch (err) {
        console.error('getEmployers error:', err);
        return sendError(res, 'Failed to fetch employers.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Transfer application to another employer
// @route   PUT /api/applications/:id/transfer
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.transferApplication = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const application = await Application.findById(req.params.id);
        if (!application) {
            return sendError(res, 'Application not found.', 404);
        }

        let logMessage = '';
        if (assignedTo) {
            const User = require('../models/User');
            const employer = await User.findOne({ _id: assignedTo, role: 'employer' });
            if (!employer) {
                return sendError(res, 'Target employer not found or invalid role.', 404);
            }
            application.assignedTo = employer._id;
            const assigneeName = `${employer.firstName} ${employer.lastName || ''}`.trim();
            logMessage = `[System] Application assigned to ${assigneeName}`;
        } else {
            application.assignedTo = null;
            logMessage = `[System] Application unassigned`;
        }

        application.replies.push({
            senderRole: 'employer',
            message: logMessage,
        });

        await application.save();

        // Fetch and return the updated application with populated fields
        const updatedApplication = await Application.findById(application._id)
            .populate('job')
            .populate('applicant', 'firstName lastName email headline skills location resumeUrl')
            .populate('resume', 'filename originalName')
            .populate('assignedTo', 'firstName lastName email companyName');

        // If assigned to a new employer, trigger a real-time notification
        if (assignedTo) {
            await sendNotification({
                recipient: assignedTo,
                sender: req.user._id,
                type: 'application_transferred',
                title: 'Application Assigned',
                message: `An application for "${updatedApplication.job.title}" has been assigned to you by ${req.user.firstName} ${req.user.lastName || ''}.`,
                link: '/employer/dashboard',
            });
        }

        return sendSuccess(res, { application: updatedApplication }, 'Application transfer updated successfully.');
    } catch (err) {
        console.error('transferApplication error:', err);
        return sendError(res, 'Failed to transfer application.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get applications assigned to the logged-in employer
// @route   GET /api/applications/assigned
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.getAssignedApplications = async (req, res) => {
    try {
        const applications = await Application.find({ assignedTo: req.user._id })
            .populate({
                path: 'job',
                select: 'title company location type salary isActive',
            })
            .populate('applicant', 'firstName lastName email headline skills location resumeUrl')
            .populate('resume', 'filename originalName')
            .sort('-updatedAt');

        return sendSuccess(res, { applications }, 'Assigned applications fetched successfully.');
    } catch (err) {
        console.error('getAssignedApplications error:', err);
        return sendError(res, 'Failed to fetch assigned applications.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Schedule interview for an application
// @route   PUT /api/applications/:id/interview
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.scheduleInterview = async (req, res) => {
    try {
        const { scheduledAt, type, linkOrLocation, notes } = req.body;

        if (!scheduledAt) {
            return sendError(res, 'Scheduled date and time are required.', 400);
        }
        if (!type || !['online', 'phone', 'in-person'].includes(type)) {
            return sendError(res, 'Valid interview type (online, phone, in-person) is required.', 400);
        }

        const application = await Application.findById(req.params.id).populate('job');
        if (!application) {
            return sendError(res, 'Application not found.', 404);
        }

        application.interview = {
            scheduledAt: new Date(scheduledAt),
            type,
            linkOrLocation: linkOrLocation || '',
            notes: notes || '',
            status: 'scheduled'
        };

        // Add a system reply/message log to the replies conversation automatically!
        const formattedDate = new Date(scheduledAt).toLocaleString();
        application.replies.push({
            senderRole: 'employer',
            message: `[System] Interview scheduled on ${formattedDate}. Type: ${type}. Details: ${linkOrLocation || 'N/A'}`
        });

        await application.save();

        // Send real-time SSE notification
        await sendNotification({
            recipient: application.applicant,
            sender: req.user._id,
            type: 'interview_scheduled',
            title: 'Interview Scheduled! 📅',
            message: `${application.job.company} has scheduled an interview for "${application.job.title}" on ${formattedDate}.`,
            link: '/dashboard'
        });

        return sendSuccess(res, { application }, 'Interview scheduled successfully.');
    } catch (err) {
        console.error('ScheduleInterview error:', err);
        return sendError(res, 'Failed to schedule interview.', 500);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Cancel scheduled interview
// @route   DELETE /api/applications/:id/interview
// @access  Private (Employer)
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelInterview = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('job');
        if (!application) {
            return sendError(res, 'Application not found.', 404);
        }

        if (!application.interview || application.interview.status === 'cancelled') {
            return sendError(res, 'No active interview to cancel.', 400);
        }

        application.interview.status = 'cancelled';

        // Add a system reply/message log to the conversation
        application.replies.push({
            senderRole: 'employer',
            message: `[System] The scheduled interview was cancelled.`
        });

        await application.save();

        // Send real-time SSE notification
        await sendNotification({
            recipient: application.applicant,
            sender: req.user._id,
            type: 'interview_cancelled',
            title: 'Interview Cancelled ❌',
            message: `${application.job.company} has cancelled the scheduled interview for "${application.job.title}".`,
            link: '/dashboard'
        });

        return sendSuccess(res, { application }, 'Interview cancelled successfully.');
    } catch (err) {
        console.error('CancelInterview error:', err);
        return sendError(res, 'Failed to cancel interview.', 500);
    }
};
