const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            maxlength: [150, 'Title cannot exceed 150 characters'],
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
            trim: true,
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        salary: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            currency: { type: String, default: 'USD' },
        },
        type: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
            default: 'full-time',
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        requirements: [{ type: String, trim: true }],
        skills: [{ type: String, trim: true }],
        experienceLevel: {
            type: String,
            enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
            default: 'mid',
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        applicationDeadline: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        applicationsCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ── Indexes for search performance ────────────────────────────────────────────
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
