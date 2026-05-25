const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: [true, 'Job reference is required'],
        },
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Applicant reference is required'],
        },
        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resume',
        },
        coverLetter: {
            type: String,
            trim: true,
            maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
            default: 'pending',
        },
        employerNotes: {
            type: String,
            trim: true,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        replies: [{
            senderRole: {
                type: String,
                enum: ['employer', 'jobseeker'],
                required: true
            },
            message: {
                type: String,
                required: true,
                trim: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        interview: {
            scheduledAt: { type: Date },
            type: { type: String, enum: ['online', 'phone', 'in-person'] },
            linkOrLocation: { type: String, trim: true },
            notes: { type: String, trim: true },
            status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' }
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate applications: one applicant per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
